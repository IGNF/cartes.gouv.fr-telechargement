import { Map } from "ol";
import {
  GeoportalFullScreen,
  GeoportalZoom,
  Legends,
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
  map.addControl(
    new LayerSwitcher({
      options: {
        position: "top-right",
      },
    })
  );
};
