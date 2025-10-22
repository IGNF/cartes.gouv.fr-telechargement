import { Map } from "ol";
import {
  GeoportalZoom,
  SearchEngine,
  Territories,
} from "geopf-extensions-openlayers";
import { SelectionModeControl } from "./Controls/SelectionModeContro";

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
  // map.addControl(
  //   new SelectionModeControl({
  //     onChange: (mode) => {
  //       console.log("Mode de sélection changé :", mode);
  //     }
  //   })
  // );
};
