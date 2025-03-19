import { create } from "zustand";
import { getStyleForDalle } from "../../utils/Maps/style";

type Dalle = { name: string; url: string; id: string };

type DalleLayer = any;

type DalleStore = {
  selectedDalles: Dalle[];
  dalleLayer: DalleLayer;
  addDalle: (dalle: Dalle) => void;
  addDalleLayer: (dalleLayer: DalleLayer) => void;
  removeDalle: (id: string) => void;
  clearDalles: () => void;
  isDalleSelected: (dalle: Dalle) => boolean;
};

export const useDalleStore = create<DalleStore>((set, get) => ({
  selectedDalles: [],
  dalleLayer: null,
  addDalle: (dalle) =>
    set((state) => ({ selectedDalles: [...state.selectedDalles, dalle] })),
  addDalleLayer: (dalleLayer) => set((state) => ({ dalleLayer: dalleLayer })),
  removeDalle: (id) => {
    set((state) => ({
      selectedDalles: state.selectedDalles.filter((d) => d.id !== id),
    }));
    console.log("hello", id);
    console.log("featuresRemoved", get().dalleLayer);

    get().dalleLayer.getFeatureById(id)?.setStyle(getStyleForDalle("default"));
  },
  clearDalles: () => {
    get().selectedDalles.forEach((dalle) =>
      get()
        .dalleLayer.getFeatureById(dalle.id)
        ?.setStyle(getStyleForDalle("default"))
    );
    set({ selectedDalles: [] });
  },
  isDalleSelected: (id) => {
    return get().selectedDalles.some((dalle) => dalle.id === id);
  },
}));
