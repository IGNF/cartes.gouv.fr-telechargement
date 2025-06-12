import { create } from "zustand";

type Dalle = { name: string; url: string; id: string };

type DalleLayer = any;

type DalleStore = {
  selectedProduits: Dalle[];
  produitLayer: DalleLayer;
  addProduit: (dalle: Dalle) => void;
  addProduitLayer: (dalleLayer: DalleLayer) => void;
  removeProduit: (id: string) => void;
  removeAllProduits: () => void;
  isProduitSelected: (dalle: Dalle) => boolean;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  produitLayer: null,
  addProduit: (produit) =>
    set((state) => ({ selectedProduits: [...state.selectedProduits, produit] })),
  addProduitLayer: (produitLayer) => set((state) => ({ produitLayer: produitLayer })),
  removeProduit: (id) => {
    get().produitLayer?.changed();
    set((state) => ({
      selectedProduits: state.selectedProduits.filter((produit) => produit.id !== id),
    }));

    // get().dalleLayer.getFeatureById(id)?.setStyle(getStyleForDalle("default"));
  },
  removeAllProduits: () => {
    get().produitLayer?.changed();
    set({ selectedProduits: [] });
  },
  isProduitSelected: (name) =>
    get().selectedProduits.some((produit) => produit.name === name),
}));
