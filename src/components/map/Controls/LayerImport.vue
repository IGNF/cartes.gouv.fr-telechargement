<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { LayerImport } from "geopf-extensions-openlayers";
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