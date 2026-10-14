<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { Territories } from "geopf-extensions-openlayers";
import { useMapStore } from "../../../stores/map";
import {
  territoriesOptions as defaultOptions,
  type TerritoriesOptions,
} from "../../../utils/maps/controlOptions";

const props = withDefaults(defineProps<{
  visibility?: boolean;
  territoriesOptions?: TerritoriesOptions;
}>(), {
  visibility: false,
  territoriesOptions: () => defaultOptions,
});

const mapStore = useMapStore();
const territories = new Territories(props.territoriesOptions);

onMounted(() => {
  watch(
    () => [mapStore.mapInstance, props.visibility] as const,
    ([map, visible], _previous, onCleanup) => {
      if (!map || !visible) return;

      map.addControl(territories);
      onCleanup(() => map.removeControl(territories));
    },
    { immediate: true, flush: "sync" },
  );
});

onUnmounted(() => territories.dispose());
</script>

<template>
  <slot :map="mapStore.mapInstance" :territories="territories" />
</template>