import { Map } from "ol";
import {
  GeoportalZoom,
  SearchEngine,
  Territories,
} from "geopf-extensions-openlayers";
import ToggleControl from "../controls/ToggleControl";
import { SelectedClickInteraction } from "../interactions/selectedClickInteraction";
import {SelectedPolygonInteraction} from "../interactions/selectedPolygonInteraction";
import useDalleStore from "../../hooks/store/useDalleStore";

/**
 * Ajoute les contrôles OpenLayers à une carte.
 * @param map - Instance de la carte OpenLayers.
 */
export const addControls = (map: Map) => {
  map.addControl(new GeoportalZoom({ position: "bottom-right" }));
  map.addControl(new SearchEngine({ position: "top-left" }));
  map.addControl(
    new Territories({
      collapsed: true,
      draggable: true,
      position: "bottom-left",
      panel: true,
      auto: true,
      thumbnail: false,
      reduce: false,
      tiles: 3,
    })
  );
};

// appel depuis ton init map : createSelectionControls(map, selectionLayer)
export function createSelectionControls(
  map: import("ol/PluggableMap").PluggableMap,
  selectionLayer: any
) {
  const store = useDalleStore.getState();

  const clickInteraction = new SelectedClickInteraction(
    selectionLayer,
    10,
    store.isProduitSelected,
    store.addProduit,
    store.removeProduit,
    store.setIsMetadata
  );
  // start inactive
  (clickInteraction as any).setActive(false);

  const polygonInteraction = new SelectedPolygonInteraction(
    selectionLayer,
    store.isProduitSelected,
    store.addProduit,
    store.removeProduit,
    store.setIsMetadata
  ).getDrawInteraction();
  (polygonInteraction as any).setActive(false);

  const clickToggle = new ToggleControl({
    className: "select-click",
    title: "Sélection par clic",
    html: "hello",
    interaction: clickInteraction,
    active: false,
    onToggle: (active) => {
      // si on active un toggle, on désactive l'autre interaction et son toggle
      if (active) {
        polygonToggle.setActive(false);
      }
    },
  });

  const polygonToggle = new ToggleControl({
    className: "select-polygon",
    title: "Sélection polygone",
    html: "▭",
    interaction: polygonInteraction,
    active: false,
    onToggle: (active) => {
      if (active) {
        clickToggle.setActive(false);
      }
    },
  });

  // map.addControl(clickToggle);
  // map.addControl(polygonToggle);

  return { clickToggle, polygonToggle, clickInteraction, polygonInteraction };
}
