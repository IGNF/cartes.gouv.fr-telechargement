<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import {
  SearchEngineAdvanced,
  InseeAdvancedSearch,
  LocationAdvancedSearch,
  CoordinateAdvancedSearch,
  ParcelAdvancedSearch,
} from "geopf-extensions-openlayers";
import { useMapStore } from "../../../stores/map";
import {
  searchEngineOptions as defaultOptions,
  type SearchEngineOptions,
} from "../../../utils/maps/controlOptions";

const props = withDefaults(defineProps<{
  visibility?: boolean;
  searchEngineOptions?: SearchEngineOptions;
}>(), {
  visibility: false,
  searchEngineOptions: () => defaultOptions,
});

const mapStore = useMapStore();
const advancedSearch = [
  new InseeAdvancedSearch(),
  new LocationAdvancedSearch(),
  new CoordinateAdvancedSearch(),
  new ParcelAdvancedSearch(),
];
// Les instances OpenLayers ne doivent pas être converties en proxies Vue.
const searchEngine = new SearchEngineAdvanced({
  ...props.searchEngineOptions,
  advancedSearch,
});

onMounted(() => {
  watch(
    () => [mapStore.mapInstance, props.visibility] as const,
    ([map, visible], _previous, onCleanup) => {
      if (!map || !visible) return;

      map.addControl(searchEngine);
      onCleanup(() => {
        searchEngine.geolocation.setTracking(false);
        map.removeInteraction(searchEngine.selectInteraction);
        map.removeOverlay(searchEngine.popup);
        searchEngine.layer.setMap(null);
        map.removeControl(searchEngine);
      });
    },
    { immediate: true, flush: "sync" },
  );
});

onUnmounted(() => {
  searchEngine.dispose();
  searchEngine.baseSearchEngine?.dispose();
  searchEngine.selectInteraction.dispose();
  searchEngine.popup.dispose();
  searchEngine.layer.dispose();
  searchEngine.geolocation.dispose();
  advancedSearch.forEach((search) => search.dispose());
});
</script>

<template>
  <slot />
</template>

<style>
#map .gpf-widget[id^="GPsearchEngine-Advanced"] {
  top: 1rem;
  left: 1rem;
  box-shadow: none;
  max-width: calc(100% - 6rem);
}

#map .GPsearchInputSubmit {
  flex-shrink: 0;
}

#map .GPsearchInputSubmit::before {
  margin: 0 auto !important;
}

@media (max-width: 600px) {
  #map .gpf-widget[id^="GPsearchEngine-Advanced"] {
    top: 0.75rem;
    left: 0.75rem;
  }

  #map .gpf-widget[id^="GPsearchEngine-Advanced"]:has(.GPSearchEngine-advanced-btn[aria-expanded="true"]) {
    z-index: 4;
  }
}
</style>