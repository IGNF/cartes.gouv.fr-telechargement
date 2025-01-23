import { Map } from "ol";
import {
  GeoportalZoom,
  SearchEngine,
  LayerSwitcher
} from "geopf-extensions-openlayers";

/**
 * Ajoute les contrôles OpenLayers à une carte.
 * @param map - Instance de la carte OpenLayers.
 */
export const addControls = (map: Map) => {
  map.addControl(new GeoportalZoom({ position: "bottom-left" }));
  map.addControl(new SearchEngine({ position: "top-right" }));

};
