<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { ScaleLine } from "ol/control";
import { useMapStore } from "../../../stores/map";
import {
  scaleLineOptions as defaultOptions,
  type ScaleLineOptions,
} from "../../../utils/maps/controlOptions";

const props = withDefaults(defineProps<{
  visibility?: boolean;
  scaleLineOptions?: ScaleLineOptions;
}>(), {
  visibility: false,
  scaleLineOptions: () => defaultOptions,
});

const mapStore = useMapStore();
const scaleLine = new ScaleLine(props.scaleLineOptions);

onMounted(() => {
  watch(
    () => [mapStore.mapInstance, props.visibility] as const,
    ([map, visible], _previous, onCleanup) => {
      if (!map || !visible) return;

      map.addControl(scaleLine);
      onCleanup(() => map.removeControl(scaleLine));
    },
    { immediate: true, flush: "sync" },
  );
});

onUnmounted(() => scaleLine.dispose());
</script>

<template>
  <slot :map="mapStore.mapInstance" :scale-line="scaleLine" />
</template>