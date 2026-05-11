import { create } from "zustand";
import useFilterStore from "./useFilterStore";
import { Dalle, FilterDate } from "../../assets/@types/types";

type DalleLayer = any;
type ChantierLayer = any;

type DalleStore = {
  selectedProduits: Dalle[];
  selectedProduitsFiltered: Dalle[]; // liste des produits selectionnées mis de coté après filtre
  fileSizes: Map<string, number>; // cache des tailles de fichiers par URL
  totalSize: number | null; // taille totale, null si au moins une taille est inconnue
  produitLayer: DalleLayer;
  chantierLayer: ChantierLayer;
  isMetadata: boolean;
  setIsMetadata: (v: boolean) => void; // <-- ajout
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
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  selectedProduitsFiltered: [],
  fileSizes: new Map(),
  totalSize: null,
  produitLayer: null,
  chantierLayer: null,
  isMetadata: false,
  setIsMetadata: (v: boolean) => set({ isMetadata: v }),
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

      // Récupérer et stocker la taille du fichier
      (async () => {
        try {
          const res = await fetch(produit.url, { method: "HEAD" });
          const size = parseInt(res.headers.get("content-length") || "0", 10) || 0;
          
          set((state) => {
            const newFileSizes = new Map(state.fileSizes);
            newFileSizes.set(produit.url, size);
            
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
        } catch (error) {
          console.error("Erreur lors du calcul de la taille :", error);
          // Définir la taille comme inconnue
          set((state) => {
            const newFileSizes = new Map(state.fileSizes);
            newFileSizes.set(produit.url, 0);
            return {
              fileSizes: newFileSizes,
              totalSize: null, // Au moins une taille est inconnue
            };
          });
        }
      })();
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
  filteredProduits: (filter) => {
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

          // Récupérer la taille du fichier
          (async () => {
            try {
              const res = await fetch(produit.url, { method: "HEAD" });
              const size = parseInt(res.headers.get("content-length") || "0", 10) || 0;
              
              set((state) => {
                const newFileSizes = new Map(state.fileSizes);
                newFileSizes.set(produit.url, size);
                
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
            } catch (error) {
              console.error("Erreur lors du calcul de la taille :", error);
              set((state) => {
                const newFileSizes = new Map(state.fileSizes);
                newFileSizes.set(produit.url, 0);
                return {
                  fileSizes: newFileSizes,
                  totalSize: null,
                };
              });
            }
          })();
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

          // Récupérer la taille du fichier
          (async () => {
            try {
              const res = await fetch(produit.url, { method: "HEAD" });
              const size = parseInt(res.headers.get("content-length") || "0", 10) || 0;
              
              set((state) => {
                const newFileSizes = new Map(state.fileSizes);
                newFileSizes.set(produit.url, size);
                
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
            } catch (error) {
              console.error("Erreur lors du calcul de la taille :", error);
              set((state) => {
                const newFileSizes = new Map(state.fileSizes);
                newFileSizes.set(produit.url, 0);
                return {
                  fileSizes: newFileSizes,
                  totalSize: null,
                };
              });
            }
          })();
        }
      }
    });

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
}));

export default useDalleStore;
