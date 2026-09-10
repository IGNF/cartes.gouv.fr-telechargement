<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type WatchStopHandle } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import VectorTileLayer from "ol/layer/VectorTile";
import { LayerWMTS } from "geopf-extensions-openlayers";
import { addControls } from "../utils/maps/controls";
import { tmsLayer } from "../utils/maps/Layers";
import { addZoomInteraction } from "../utils/maps/interactions";
import { useMapStore } from "../stores/map";
import { useDalleStore } from "../stores/dalle";
import { useFilterStore } from "../stores/filter";
import { getStyleForBlocs, getStyleForDalle } from "../utils/maps/style";
import { SelectedClickInteraction } from "../utils/interactions/selectedClickInteraction";
import { SelectedPolygonInteraction } from "../utils/interactions/selectedPolygonInteraction";
import Gp from "geoportal-access-lib";

const props = defineProps<{ downloadUrl: string }>();
const mapElement = ref<HTMLDivElement | null>(null);
const mapStore = useMapStore();
const dalleStore = useDalleStore();
const filterStore = useFilterStore();
let map: Map | null = null;
let isDisposed = false;
let stopSelectionWatch: WatchStopHandle | null = null;

function createMap() {
  if (!mapElement.value || map) return;

  const chantierLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${props.downloadUrl}-chantier/{z}/{x}/{y}.pbf`,
    10,
  );
  chantierLayer.setStyle((feature) => {
    const timestamp = new Date(feature.getProperties().timestamp).getTime();
    if (timestamp < (filterStore.filter.dateStart ?? 0) || timestamp > filterStore.filter.dateEnd) return getStyleForDalle("filtered");
    return getStyleForBlocs(feature);
  });
  const produitLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${props.downloadUrl}-produit/{z}/{x}/{y}.pbf`,
    16,
  );
  const selectionProduitLayer = new VectorTileLayer({
    renderMode: "vector",
    source: produitLayer.getSource() ?? undefined,
    style: (feature) => {
      const id = String(feature.getProperties().id);
      const timestamp = new Date(feature.getProperties().timestamp).getTime();
      if (dalleStore.isDalleHovered(id)) return getStyleForDalle("hovered");
      if (dalleStore.isProduitSelected(id)) return getStyleForDalle("selected");
      if (dalleStore.isProduitFiltered(id) || timestamp < (filterStore.filter.dateStart ?? 0) || timestamp > filterStore.filter.dateEnd) return getStyleForDalle("filtered");
      return getStyleForDalle("default");
    },
  });

  map = new Map({
    target: mapElement.value,
    layers: [
      new LayerWMTS({ layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" }),
      chantierLayer,
      selectionProduitLayer,
    ],
    view: new View({
      center: [288074.8449901076, 6247982.515792289],
      zoom: 6,
      maxZoom: 16,
    }),
  });
  addControls(map);
  addZoomInteraction(map, chantierLayer, 11);
  dalleStore.setProduitLayer(selectionProduitLayer);
  dalleStore.setChantierLayer(chantierLayer);

  const polygonInteraction = new SelectedPolygonInteraction(
    selectionProduitLayer,
    (id) => dalleStore.isProduitSelected(String(id)),
    dalleStore.addProduit,
    dalleStore.removeProduit,
    dalleStore.addHistoricStep,
  ).getDrawInteraction();
  polygonInteraction.setActive(mapStore.selectionMode === "polygon");
  map.addInteraction(polygonInteraction);

  const clickInteraction = new SelectedClickInteraction(
    selectionProduitLayer,
    10,
    (id) => dalleStore.isProduitSelected(String(id)),
    dalleStore.addProduit,
    dalleStore.removeProduit,
    (value: boolean) => { dalleStore.isMetadata = value; },
    dalleStore.addHistoricStep,
  );
  clickInteraction.setActive(mapStore.selectionMode !== "polygon");
  map.addInteraction(clickInteraction);

  stopSelectionWatch = watch(
    () => mapStore.selectionMode,
    (mode) => {
      polygonInteraction.setActive(mode === "polygon");
      clickInteraction.setActive(mode !== "polygon");
    },
  );
  mapStore.setMapInstance(map);
}

onMounted(async () => {
  const config = new Gp.Services.Config({
    customConfigFile: "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
    onSuccess: () => {
      if (!isDisposed) createMap();
    },
    onFailure: (error: unknown) => console.error("Impossible de charger la configuration Geoplateforme", error),
  });
  await config.call();
});

watch(
  () => props.downloadUrl,
  () => {
    stopSelectionWatch?.();
    stopSelectionWatch = null;
    map?.setTarget(undefined);
    map?.dispose();
    map = null;
    createMap();
  },
);

onUnmounted(() => {
  isDisposed = true;
  stopSelectionWatch?.();
  stopSelectionWatch = null;
  mapStore.setMapInstance(null);
  map?.setTarget(undefined);
  map?.dispose();
  map = null;
});
</script>

<template>
  <div ref="mapElement" id="map" class="fr-col-8 map-container" style="height: 80vh; width: 100%">
    <div class="selected-options-container" aria-label="Options de selection">
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-cursor-line"
        :disabled="mapStore.selectionMode === 'click'"
        title="Selectionner par clic"
        @click="mapStore.setSelectionMode('click')"
      />
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-polygon-icon"
        :disabled="mapStore.selectionMode === 'polygon'"
        title="Selectionner par surface"
        @click="mapStore.setSelectionMode('polygon')"
      />
    </div>
    <div class="history-navigation-container" aria-label="Navigation dans l'historique">
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-go-back-line"
        :disabled="dalleStore.historicPastSteps.length === 0"
        title="Annuler"
        @click="dalleStore.navigateHistory('undo')"
      />
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-go-forward-line"
        :disabled="dalleStore.historicFutureSteps.length === 0"
        title="Retablir"
        @click="dalleStore.navigateHistory('redo')"
      />
    </div>
  </div>
</template>

<style>
.selected-options-container,
.history-navigation-container {
  position: absolute;
  right: 1rem;
  z-index: 1000;
  display: inline-flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 8px;
  pointer-events: auto;
  border-radius: 4px;
  background: var(--light-decisions-background-background-default-grey, #fff);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.selected-options-container {
  top: 1rem;
}

.history-navigation-container {
  top: 50%;
  transform: translateY(-50%);
}

#map {
  position: relative;
}

.fr-icon-polygon-icon::before,
.fr-icon-polygon-icon::after {
  -webkit-mask-image: url("../assets/icon/trace.svg");
  mask-image: url("../assets/icon/trace.svg");
}

.ol-scale-line {
  left: 58px;
}

@media (max-width: 600px) {
  .selected-options-container {
    top: 0.75rem;
    right: 0.75rem;
    padding: 6px;
  }

  .history-navigation-container {
    top: calc(0.75rem + 108px);
    right: 0.75rem;
    padding: 6px;
    transform: none;
  }
}
</style>