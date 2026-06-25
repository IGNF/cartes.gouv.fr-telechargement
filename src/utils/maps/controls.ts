import { Map } from "ol";
import {
  GeoportalZoom,
  SearchEngineAdvanced,
  Territories,
} from "geopf-extensions-openlayers";
import { ScaleLine } from "ol/control";

/**
 * Ajoute les contrôles OpenLayers à une carte.
 * @param map - Instance de la carte OpenLayers.
 */
export const addControls = (map: Map) => {
  map.addControl(new GeoportalZoom({ position: "bottom-right" }));
  const search = new SearchEngineAdvanced({
    position: "top-left",
  });
  map.addControl(search);
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
    }),
  );
  map.addControl(new ScaleLine());

  // // On désactive les styles pour avoir une recherche simple
  // search.selectInteraction.style = null;
  // search.layer.setMap();
  // search.popup.setMap();
  // search.selectInteraction.setMap();
  // search.layer.setStyle(null); // désactive le style par défaut des résultats de recherche
};

