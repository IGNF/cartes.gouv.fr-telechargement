import { create } from "zustand";

type Map = null;

type MapStore = {
  map: Map;
  addMap: (map: Map) => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
  map: null,
  addMap: (map) =>
    set((state) => ({ map: map})),
}));
