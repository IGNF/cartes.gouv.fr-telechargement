import { create } from "zustand";

type Dalle = { name: string; url: string; id: string, size: number , metadata?: any };

type DalleLayer = any;

type DalleStore = {
  selectedProduits: Dalle[];
  produitLayer: DalleLayer;
  isMetadata: boolean;
  setIsMetadata: (v: boolean) => void; // <-- ajout
  addProduit: (dalle: Dalle) => void;
  addProduitLayer: (dalleLayer: DalleLayer) => void;
  removeProduit: (id: string) => void;
  removeAllProduits: () => void;
  isProduitSelected: (id: string) => boolean;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedProduits: [],
  produitLayer: null,
  isMetadata: false,
  setIsMetadata: (v: boolean) => set({ isMetadata: v }),
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
  isProduitSelected: (id) =>
    get().selectedProduits.some((produit) => produit.id === id),
}));

export default useDalleStore;