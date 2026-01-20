import { create } from "zustand";
import useFilterStore from "./useFilterStore";

type Dalle = {
  name: string;
  url: string;
  id: string;
  size: number;
  timestamp?: any;
  metadata?: any;
  isHovered?: boolean;
};

type DalleLayer = any;
type ChantierLayer = any;

type filterDate = { dateStart: number; dateEnd: number };

type DalleStore = {
  selectedProduits: Dalle[];
  selectedProduitsFiltered: Dalle[]; // liste des produits selectionnées mis de coté après filtre
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
  filteredProduits: (filter: filterDate) => void;
  isProduitFiltered: (id: string) => boolean;
  isDalleHovered: (id: string) => boolean;
  setIsHovered: (id: string, isHovered: boolean) => void;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  selectedProduitsFiltered: [],
  produitLayer: null,
  chantierLayer: null,
  isMetadata: false,
  setIsMetadata: (v: boolean) => set({ isMetadata: v }),
  addProduit: (produit) => {
    const filter = useFilterStore.getState().filter;
    set((state) => ({
      selectedProduits: [...state.selectedProduits, produit],
    }));
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
    set((state) => ({
      selectedProduits: state.selectedProduits.filter(
        (produit) => produit.id !== id
      ),
    }));

    set((state) => ({
      selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
        (produit) => produit.id !== id
      ),
    }));

  },
  removeAllProduits: () => {
    get().produitLayer?.changed();
    set({ selectedProduits: [] });
    set({ selectedProduitsFiltered: [] });
  },
  isProduitSelected: (id) =>
    get().selectedProduits.some((produit) => produit.id === id),
  filteredProduits: (filter) => {
    

    get().selectedProduits.forEach((produit) => {
      if (
        produit.timestamp <= filter.dateStart ||
        produit.timestamp >= filter.dateEnd
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
      if (
        produit.timestamp >= filter.dateStart &&
        produit.timestamp <= filter.dateEnd
      ) {
        // on réajoute les produits qui sont dans l'intervalle de date
        set((state) => ({
          selectedProduits: [...state.selectedProduits, produit],
        }));
        console.log('hello je rajoute après test', produit);

        // on les supprime de selectedProduitsFiltered
        set((state) => ({
          selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
            (p) => p.id !== produit.id
          ),
        }));
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
  setIsHovered : (id, isHovered) => {
    set((state) => ({
      selectedProduits: state.selectedProduits.map((produit) =>
        produit.id === id ? { ...produit, isHovered:isHovered } : produit
      ),
    }));
    get().produitLayer?.changed();
  }
}));

export default useDalleStore;
