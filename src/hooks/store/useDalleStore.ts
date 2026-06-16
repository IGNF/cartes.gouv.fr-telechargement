import { create } from "zustand";
import useFilterStore from "./useFilterStore";
import { Dalle, FilterDate, HistoricItem, HistoricStep } from "../../assets/@types/types";

type DalleLayer = any;
type ChantierLayer = any;

// Rate limiting constants
const MAX_CONCURRENT_REQUESTS = 3;
const MAX_REQUESTS_PER_SECOND = 10;

// Queue pour gérer les requêtes de taille avec rate limiting
interface SizeRequest {
  url: string;
  produitId: string;
}

let sizeQueue: SizeRequest[] = [];
let isProcessingQueue = false;

/**
 * Traite la file d'attente des requêtes de taille avec rate limiting.
 */
async function processSizeQueue(): Promise<void> {
  if (isProcessingQueue || sizeQueue.length === 0) return;
  
  isProcessingQueue = true;

  try {
    // Découpe en fenêtres de MAX_REQUESTS_PER_SECOND
    const windows: SizeRequest[][] = [];
    for (let i = 0; i < sizeQueue.length; i += MAX_REQUESTS_PER_SECOND) {
      windows.push(sizeQueue.slice(i, i + MAX_REQUESTS_PER_SECOND));
    }

    sizeQueue = []; // Vider la queue après découpe

    for (const window of windows) {
      const windowStart = Date.now();

      // Traite la fenêtre avec une limite de concurrence
      const chunks = [];
      for (let i = 0; i < window.length; i += MAX_CONCURRENT_REQUESTS) {
        chunks.push(window.slice(i, i + MAX_CONCURRENT_REQUESTS));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (req) => {
            try {
              const res = await fetch(req.url, { method: "HEAD" });
              const size = parseInt(res.headers.get("content-length") || "0", 10) || 0;
              
              // Utiliser useDalleStore pour mettre à jour le state
              const store = useDalleStore.getState();
              store.updateFileSize(req.url, size);
            } catch (error) {
              console.error("Erreur lors du calcul de la taille :", error);
              const store = useDalleStore.getState();
              store.updateFileSize(req.url, 0);
            }
          })
        );
      }

      // Attendre le reste de la seconde si la fenêtre s'est terminée trop vite
      const elapsed = Date.now() - windowStart;
      const remaining = 1000 - elapsed;
      if (remaining > 0 && windows.indexOf(window) < windows.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
  } finally {
    isProcessingQueue = false;
    // Continuer avec les nouvelles requêtes si elles ont été ajoutées
    if (sizeQueue.length > 0) {
      processSizeQueue();
    }
  }
}

type DalleStore = {
  selectedProduits: Dalle[];
  selectedProduitsFiltered: Dalle[]; // liste des produits selectionnées mis de coté après filtre
  historicPastSteps: HistoricStep[];
  historicFutureSteps: HistoricStep[];
  fileSizes: Map<string, number>; // cache des tailles de fichiers par URL
  totalSize: number | null; // taille totale, null si au moins une taille est inconnue
  produitLayer: DalleLayer;
  chantierLayer: ChantierLayer;
  isMetadata: boolean;
  setIsMetadata: (v: boolean) => void;
  updateFileSize: (url: string, size: number) => void;
  addProduit: (dalle: Dalle) => void;
  addProduitLayer: (dalleLayer: DalleLayer) => void;
  addChantierLayer: (chantierLayer: ChantierLayer) => void;
  removeProduit: (id: string) => void;
  removeAllProduits: () => void;
  isProduitSelected: (id: string) => boolean;
  filteredProduits: (filter: FilterDate) => void;
  isProduitFiltered: (id: string) => boolean;
  isDalleHovered: (id: string) => boolean;
  setIsHovered: (id: string, isHovered: boolean) => void;
  addHistoricStep: (step: HistoricStep) => void;
  navigateHistory: (action: "undo" | "redo") => void;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  selectedProduitsFiltered: [],
  historicPastSteps: [],
  historicFutureSteps: [],
  fileSizes: new Map(),
  totalSize: null,
  produitLayer: null,
  chantierLayer: null,
  isMetadata: false,
  setIsMetadata: (v: boolean) => set({ isMetadata: v }),
  
  /**
   * Met à jour la taille d'un fichier et recalcule le total.
   * Appelée par la queue de traitement des requêtes.
   */
  updateFileSize: (url: string, size: number) => {
    set((state) => {
      const newFileSizes = new Map(state.fileSizes);
      newFileSizes.set(url, size);

      // Recalculer le total
      const sizes = Array.from(newFileSizes.values());
      const allKnown = sizes.every((s) => s !== null && s > 0);
      const newTotal = allKnown
        ? sizes.reduce<number>((acc, s) => acc + (s ?? 0), 0)
        : null;

      return {
        fileSizes: newFileSizes,
        totalSize: newTotal,
      };
    });
  },

  addProduit: (produit) => {
    const filter = useFilterStore.getState().filter;
     
    if (
      (filter.dateStart === null || produit.timestamp >= filter.dateStart) &&
      (filter.dateEnd === null || produit.timestamp <= filter.dateEnd)
    ) {
      // Ajouter le produit à la sélection
      set((state) => ({
        selectedProduits: [...state.selectedProduits, produit],
      }));

      // Enqueuer la requête de taille
      sizeQueue.push({ url: produit.url, produitId: produit.id });
      processSizeQueue();
    }
    
    get().filteredProduits({
      dateStart: filter.dateStart,
      dateEnd: filter.dateEnd,
    });
  },
  addProduitLayer: (produitLayer) =>
    set((state) => ({ produitLayer: produitLayer })),
  addChantierLayer: (chantierLayer) =>
    set((state) => ({ chantierLayer: chantierLayer })),
  removeProduit: (id) => {
    get().produitLayer?.changed();
    
    // Récupérer l'URL du produit avant de le supprimer
    const produit = get().selectedProduits.find((p) => p.id === id);
    
    set((state) => ({
      selectedProduits: state.selectedProduits.filter(
        (produit) => produit.id !== id,
      ),
    }));

    set((state) => ({
      selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
        (produit) => produit.id !== id,
      ),
    }));

    // Retirer la taille du cache et recalculer le total
    if (produit) {
      set((state) => {
        const newFileSizes = new Map(state.fileSizes);
        newFileSizes.delete(produit.url);
        
        // Recalculer le total
        if (newFileSizes.size === 0) {
          return {
            fileSizes: newFileSizes,
            totalSize: null,
          };
        }
        
        const sizes = Array.from(newFileSizes.values());
        const allKnown = sizes.every((s) => s !== null && s > 0);
        const newTotal = allKnown
          ? sizes.reduce<number>((acc, s) => acc + (s ?? 0), 0)
          : null;
        
        return {
          fileSizes: newFileSizes,
          totalSize: newTotal,
        };
      });
    }
  },
  removeAllProduits: () => {
    get().produitLayer?.changed();
    set({ selectedProduits: [] });
    set({ selectedProduitsFiltered: [] });
    set({ fileSizes: new Map(), totalSize: null });
  },
  isProduitSelected: (id) =>
    get().selectedProduits.some((produit) => produit.id === id),
  filteredProduits: (filter: FilterDate) => {
    const produitsTmp = [...get().selectedProduits];
    produitsTmp.forEach((produit) => {
      if (
        (filter.dateStart !== null && produit.timestamp <= filter.dateStart) ||
        (filter.dateEnd !== null && produit.timestamp >= filter.dateEnd)
      ) {
        get().removeProduit(produit.id);
        set((state) => ({
          selectedProduitsFiltered: [
            ...state.selectedProduitsFiltered,
            produit,
          ],
        }));
      }
    });
    // on réajoute les produits qui sont dans l'intervalle de date
    get().selectedProduitsFiltered.forEach((produit) => {
      if (filter.dateStart == null) {
        const dateStart = 0;

        if (
          produit.timestamp >= dateStart &&
          (filter.dateEnd === null || produit.timestamp <= filter.dateEnd)
        ) {
          // on réajoute les produits qui sont dans l'intervalle de date
          set((state) => ({
            selectedProduits: [...state.selectedProduits, produit],
          }));

          // on les supprime de selectedProduitsFiltered
          set((state) => ({
            selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
              (p) => p.id !== produit.id,
            ),
          }));

          // Enqueuer la requête de taille au lieu de la lancer directement
          sizeQueue.push({ url: produit.url, produitId: produit.id });
        }
      } else {
        const dateStart = filter.dateStart;

        if (
          produit.timestamp >= dateStart &&
          (filter.dateEnd === null || produit.timestamp <= filter.dateEnd)
        ) {
          // on réajoute les produits qui sont dans l'intervalle de date
          set((state) => ({
            selectedProduits: [...state.selectedProduits, produit],
          }));

          // on les supprime de selectedProduitsFiltered
          set((state) => ({
            selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
              (p) => p.id !== produit.id,
            ),
          }));

          // Enqueuer la requête de taille au lieu de la lancer directement
          sizeQueue.push({ url: produit.url, produitId: produit.id });
        }
      }
    });

    // Traiter les requêtes de taille enqueues
    processSizeQueue();

    get().produitLayer?.changed();
    get().chantierLayer?.changed();
  },
  isProduitFiltered: (id) =>
    get().selectedProduitsFiltered.some((produit) => produit.id === id),
  isDalleHovered: (id) => {
    const produit = get().selectedProduits.find((produit) => produit.id === id);
    return produit ? produit.isHovered || false : false;
  },
  setIsHovered: (id, isHovered) => {
    set((state) => ({
      selectedProduits: state.selectedProduits.map((produit) =>
        produit.id === id ? { ...produit, isHovered: isHovered } : produit,
      ),
    }));
    get().produitLayer?.changed();
  },
  addHistoricStep: (step: HistoricStep) => {
    set((state) => ({
      historicPastSteps: [...state.historicPastSteps, step],
      historicFutureSteps: [],
    }));
  },
  navigateHistory: (action) => {
    const { selectedProduits, historicPastSteps, historicFutureSteps } = get();
    if (action === "undo") {
      const lastHistoricStep = historicPastSteps[historicPastSteps.length - 1];
        // Si le dernier élément historique est une action "filter", on réapplique le filtre correspondant
        if (lastHistoricStep[0].action === "filter" && lastHistoricStep[0].filter) {
          let currentFilter = useFilterStore.getState().filter;
          useFilterStore.getState().setFilterOnChange(lastHistoricStep[0].filter);
          get().filteredProduits(lastHistoricStep[0].filter);

          set((state) => ({
          historicPastSteps: state.historicPastSteps.slice(
            0,
            state.historicPastSteps.length - 1,
          ),
          historicFutureSteps: [...state.historicFutureSteps, [{ action: "filter", filter: currentFilter }]],
        }));
      }
      // Si le dernier élément historique est une action "add", on retire les produits correspondants
      else {
        lastHistoricStep.forEach((lastHistoricItem) => {
          if (lastHistoricItem.action === "add" && lastHistoricItem.dalles) {
            lastHistoricItem.dalles.forEach((dalle) => {
              get().removeProduit(dalle.id);
            });
          }
          // Si le dernier élément historique est une action "remove", on réajoute les produits correspondants
          if (lastHistoricItem.action === "remove" && lastHistoricItem.dalles) {
            lastHistoricItem.dalles.forEach((dalle) => {
              get().addProduit(dalle);
            });
          }
        });
        // On met à jour les historiques après l'action
        set((state) => ({
          historicPastSteps: state.historicPastSteps.slice(
            0,
            state.historicPastSteps.length - 1,
          ),
          historicFutureSteps: [...state.historicFutureSteps, lastHistoricStep],
        }));
      }
    } else if (action === "redo") {
      const nextHistoricStep = historicFutureSteps[historicFutureSteps.length - 1];
      // Si le prochain élément historique est une action "filter", on réapplique le filtre correspondant
      if (nextHistoricStep[0].action === "filter" && nextHistoricStep[0].filter) {
        let currentFilter = useFilterStore.getState().filter;
        useFilterStore.getState().setFilterOnChange(nextHistoricStep[0].filter);
        get().filteredProduits(nextHistoricStep[0].filter);

        set((state) => ({
          historicFutureSteps: state.historicFutureSteps.slice(
            0,
            state.historicFutureSteps.length - 1,
          ),
          historicPastSteps: [...state.historicPastSteps, [{ action: "filter", filter: currentFilter }]],
        }));
      }
      // Si le prochain élément historique est une action "add", on réajoute les produits correspondants
      else {
        nextHistoricStep.forEach((nextHistoricItem) => {
          if (nextHistoricItem.action === "add" && nextHistoricItem.dalles) {
            nextHistoricItem.dalles.forEach((dalle) => {
              get().addProduit(dalle);
            });
          }
          // Si le prochain élément historique est une action "remove", on retire les produits correspondants
          if (nextHistoricItem.action === "remove" && nextHistoricItem.dalles) {
            nextHistoricItem.dalles.forEach((dalle) => {
              get().removeProduit(dalle.id);
            });
          }
        });
        // On met à jour les historiques après l'action
        set((state) => ({
          historicFutureSteps: state.historicFutureSteps.slice(
            0,
            state.historicFutureSteps.length - 1,
          ),
          historicPastSteps: [...state.historicPastSteps, nextHistoricStep],
        }));
      }
    }

    get().produitLayer?.changed();
    get().chantierLayer?.changed();
  }
}));

export default useDalleStore;
