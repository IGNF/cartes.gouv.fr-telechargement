import { create } from "zustand";
import { Coordinate } from "ol/coordinate";
type SelectionMode = "click" | "polygon" | "upload";
type Map = any; // Replace with actual map type if available

interface MapStore {
  mapInstance: Map;
  center: Coordinate;
  zoom: number;
  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setMapInstance: (instance: any) => void;
}

const useMapStore = create<MapStore>((set, get) => ({
  center: [288074.8449901076, 6247982.515792289],
  zoom: 6,
  setCenter: (center) => set({ center: center }),
  setZoom: (zoom) => set({ zoom : zoom }),
  mapInstance: null,
  setMapInstance: (instance) => set({ mapInstance: instance })
}));

export default useMapStore;
