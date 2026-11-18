<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { LayerImport } from "geopf-extensions-openlayers";
import VectorLayer from "ol/layer/Vector";
import { useMapStore } from "../../../stores/map";
import {
  layerImportOptions as defaultOptions,
  type LayerImportOptions,
} from "../../../utils/maps/controlOptions";

const props = withDefaults(defineProps<{
  visibility?: boolean;
  layerImportOptions?: LayerImportOptions;
}>(), {
  visibility: false,
  layerImportOptions: () => defaultOptions,
});

const mapStore = useMapStore();
// Conserver l'instance OpenLayers hors de la réactivité profonde de Vue.
const layerImport = new LayerImport(props.layerImportOptions);

layerImport.addEventListener("layerimport:vector:added", (event) => {
  if (!("layer" in event) || !(event.layer instanceof VectorLayer)) return;

  // Les styles propres aux entités masquent le style défini sur la couche.
  for (const feature of event.layer.getSource()?.getFeatures() ?? []) {
    feature.setStyle(undefined);
  }
});

onMounted(() => {
  watch(
    () => [mapStore.mapInstance, props.visibility] as const,
    ([map, visible], _previous, onCleanup) => {
      if (!map || !visible) return;

      map.addControl(layerImport);
      onCleanup(() => map.removeControl(layerImport));
    },
    { immediate: true, flush: "sync" },
  );
});

onUnmounted(() => layerImport.dispose());
</script>

<template>
  <slot :map="mapStore.mapInstance" :layer-import="layerImport" />
</template>