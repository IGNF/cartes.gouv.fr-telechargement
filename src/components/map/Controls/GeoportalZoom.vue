<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { GeoportalZoom } from "geopf-extensions-openlayers";
import { useMapStore } from "../../../stores/map";
import {
  geoportalZoomOptions as defaultOptions,
  type GeoportalZoomOptions,
} from "../../../utils/maps/controlOptions";

const props = withDefaults(defineProps<{
  visibility?: boolean;
  geoportalZoomOptions?: GeoportalZoomOptions;
}>(), {
  visibility: false,
  geoportalZoomOptions: () => defaultOptions,
});

const mapStore = useMapStore();
const geoportalZoom = new GeoportalZoom(props.geoportalZoomOptions);

onMounted(() => {
  watch(
    () => [mapStore.mapInstance, props.visibility] as const,
    ([map, visible], _previous, onCleanup) => {
      if (!map || !visible) return;

      map.addControl(geoportalZoom);
      onCleanup(() => map.removeControl(geoportalZoom));
    },
    { immediate: true, flush: "sync" },
  );
});

onUnmounted(() => geoportalZoom.dispose());
</script>

<template>
  <slot :map="mapStore.mapInstance" :geoportal-zoom="geoportalZoom" />
</template>