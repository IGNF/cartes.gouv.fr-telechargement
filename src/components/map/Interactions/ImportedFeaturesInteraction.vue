<script setup lang="ts">
import { ref, watch } from "vue";
import type { LayerImport } from "geopf-extensions-openlayers";
import type Map from "ol/Map";
import Overlay from "ol/Overlay";
import VectorLayer from "ol/layer/Vector";
import Select from "ol/interaction/Select";
import { click, never } from "ol/events/condition";
import type { ListenerFunction } from "ol/events";
import { unByKey } from "ol/Observable";

const props = defineProps<{
  map: Map | null;
  layerImport: LayerImport;
}>();

const popupElement = ref<HTMLDivElement | null>(null);
// Les objets OpenLayers restent hors de la réactivité profonde de Vue.
let selectInteraction: Select | null = null;
let popupOverlay: Overlay | null = null;
const importedLayers = new Set<VectorLayer>();

function closePopup() {
  popupOverlay?.setPosition(undefined);
  selectInteraction?.getFeatures().clear();
}

function removeFeatures() {
  // Cloner la sélection avant de la vider : getArray() expose le tableau interne.
  const features = [...(selectInteraction?.getFeatures().getArray() ?? [])];
  closePopup();
  for (const layer of importedLayers) {
    const source = layer.getSource();
    for (const feature of features) {
      if (source?.hasFeature(feature)) source.removeFeature(feature);
    }
  }
}

watch(
  () => [props.map, props.layerImport, popupElement.value] as const,
  ([map, layerImport, element], _previous, onCleanup) => {
    if (!map || !element) return;

    const handleImportedLayer: ListenerFunction = (event) => {
      if ("layer" in event && event.layer instanceof VectorLayer) {
        importedLayers.add(event.layer);
      }
    };
    layerImport.addEventListener("layerimport:vector:added", handleImportedLayer);

    const overlay = new Overlay({
      element,
      positioning: "bottom-center",
      offset: [0, -10],
      stopEvent: true,
    });
    popupOverlay = overlay;
    map.addOverlay(overlay);

    const isImportedLayer = (layer: unknown) => layer instanceof VectorLayer && importedLayers.has(layer);
    const select = new Select({
      layers: isImportedLayer,
      condition: click,
      toggleCondition: never,
      style: null,
      hitTolerance: 5,
    });
    selectInteraction = select;

    const selectListener = select.on("select", (event) => {
      if (!event.selected.length || !event.mapBrowserEvent) {
        closePopup();
        return;
      }
      overlay.setPosition(event.mapBrowserEvent.coordinate);
    });
    map.addInteraction(select);

    onCleanup(() => {
      closePopup();
      unByKey(selectListener);
      layerImport.removeEventListener("layerimport:vector:added", handleImportedLayer);
      map.removeInteraction(select);
      map.removeOverlay(overlay);
      importedLayers.clear();
      selectInteraction = null;
      popupOverlay = null;
    });
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <div class="imported-features-interaction">
    <div ref="popupElement" class="GPSearchPopup imported-feature-popup" role="group" aria-label="Actions sur l'emprise importée">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-close-line"
        aria-label="Fermer la pop-up"
        title="Fermer la pop-up"
        @click="closePopup"
      />
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-line"
        aria-label="Supprimer l'emprise"
        title="Supprimer l'emprise"
        @click="removeFeatures"
      />
    </div>
  </div>
</template>

<style scoped>
.imported-feature-popup {
  display: flex;
  width: auto;
  background: var(--background-default-grey, #fff);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
</style>