import { defineStore } from "pinia";
import { markRaw, shallowRef } from "vue";
import type Map from "ol/Map";

export type SelectionMode = "click" | "polygon" | "upload";

export const useMapStore = defineStore("map", () => {
  const selectionMode = shallowRef<SelectionMode>("click");
  const mapInstance = shallowRef<Map | null>(null);

  function setSelectionMode(mode: SelectionMode) {
    selectionMode.value = mode;
  }

  function setMapInstance(instance: Map | null) {
    mapInstance.value = instance ? markRaw(instance) : null;
  }

  return { selectionMode, mapInstance, setSelectionMode, setMapInstance };
});