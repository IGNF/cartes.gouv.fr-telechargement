import { create } from "zustand";
import { addPolygonSelectionInteraction } from "../../utils/Maps/interactions";
import { addUploadSelectionInteraction } from "../../utils/Maps/interactions";
import { addSelectedProduitInteraction } from "../../utils/Maps/interactions";

type SelectionMode = "click" | "polygon" | "upload";
type Map = any; // Replace with actual map type if available

interface MapStore {
  selectionMode: SelectionMode;
  mapInstance: Map;
  setMapInstance: (instance: any) => void;
  addProduitLayer: (layer: any) => void; // Replace with actual layer type
  setSelectionMode: (mode: SelectionMode) => void;
  handleModeChange: () => void;
}

const useMapStore = create<MapStore>((set, get) => ({
  selectionMode: "click",
  setSelectionMode: (mode) => {
    set({ selectionMode: mode });
  },
  mapInstance: null,
  setMapInstance: (instance) => set({ mapInstance: instance }),
  addProduitLayer: (layer) => {
    if (get().mapInstance) {
      get().mapInstance.addLayer(layer);
    }
  },
  // This function is used to change the selection mode and add/remove interactions accordingly
  handleModeChange: () => {
    const selectionMode = get().selectionMode;
    const mapInstance = get().mapInstance;

    mapInstance.getInteractions().forEach((interaction) => {
    });

  },
}));

export default useMapStore;
