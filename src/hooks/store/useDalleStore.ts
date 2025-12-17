import { create } from "zustand";
import useFilterStore from "./useFilterStore";

type Dalle = {
  name: string;
  url: string;
  id: string;
  size: number;
  timestamp?: any;
  metadata?: any;
};

type DalleLayer = any;

type filterDate = { dateStart: number; dateEnd: number };

type DalleStore = {
  selectedProduits: Dalle[];
  selectedProduitsFiltered: Dalle[];
  produitLayer: DalleLayer;
  isMetadata: boolean;
  setIsMetadata: (v: boolean) => void; // <-- ajout
  addProduit: (dalle: Dalle) => void;
  addProduitLayer: (dalleLayer: DalleLayer) => void;
  removeProduit: (id: string) => void;
  removeAllProduits: () => void;
  isProduitSelected: (id: string) => boolean;
  filteredProduits: (filter: filterDate) => void;
  isProduitFiltered: (id: string) => boolean;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  selectedProduitsFiltered: [],
  produitLayer: null,
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

    // get().dalleLayer.getFeatureById(id)?.setStyle(getStyleForDalle("default"));
  },
  removeAllProduits: () => {
    get().produitLayer?.changed();
    set({ selectedProduits: [] });
    set({ selectedProduitsFiltered: [] });
  },
  isProduitSelected: (id) =>
    get().selectedProduits.some((produit) => produit.id === id),
  filteredProduits: (filter) => {
    let produitsFiltered: Dalle[] = [];
    get().selectedProduits.forEach((produit) => {
      if (
        produit.timestamp <= filter.dateStart ||
        produit.timestamp >= filter.dateEnd
      ) {
        get().removeProduit(produit.id);
        set((state) => ({
          selectedProduitsFiltered: [...state.selectedProduitsFiltered, produit],
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
        // on les supprime de selectedProduitsFiltered
        set((state) => ({
          selectedProduitsFiltered: state.selectedProduitsFiltered.filter(
            (p) => p.id !== produit.id
          ),
        }));
      }
    });

  },
  isProduitFiltered: (id) =>
    get().selectedProduitsFiltered.some((produit) => produit.id === id),
}));

export default useDalleStore;
