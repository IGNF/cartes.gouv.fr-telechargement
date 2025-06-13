import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle } from "./style";
import { Select } from "ol/interaction";
import { click, platformModifierKeyOnly } from "ol/events/condition";
import { easeOut } from "ol/easing";
import { buffer, getCenter } from "ol/extent";
import { transformExtent } from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import {
  generateDownloadLinkMNX,
  generateDownloadLinkPPK,
} from "../flux/generateDownloadLink";

proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs"
);

proj4.defs(
  "EPSG:2952",
  "+proj=utm +zone=22 +ellps=GRS80 +datum=RGFG95 +units=m +no_defs"
);

register(proj4);

/**
 * Génère un style OpenLayers basé sur le type d'interaction ou d'état.
 *
 * @param type - Le type de style à appliquer, correspondant à une clé dans `styleDalle`.
 *               Exemple : "select" ou "pointer_move_dalle_menu".
 * @returns Un objet `Style` configuré pour OpenLayers.
 */

let addHoveredInteractionDone = false;
export const addHoveredInteraction = (
  map: Map,
  vectorLayer: any,
  isSelected: any
) => {
  if (!addHoveredInteractionDone) {
    var selectInteraction = new Select({
      condition: function (event) {
        return event.type === "pointermove";
      },
      layers: [vectorLayer],
    });

    let oldDallesSelect: FeatureLike | null = null;

    selectInteraction.on("select", (event) => {
      var selectedFeature = event.selected[0];
      // quand on survole une dalle cliquer on met le style d'une dalle cliquer
      // quand on quitte la dalle survolé
      if (event.deselected.length > 0) {
        if (oldDallesSelect !== null) {
          var selected = oldDallesSelect.get("selected");
          if (!isSelected(oldDallesSelect.getId())) {
            // si on survol une dalle non cliqué alors on remet le style null
            oldDallesSelect.setStyle(undefined);
          } else {
            oldDallesSelect.setStyle(getStyleForDalle("selected"));
          }
        }
      }
      // on stocke la derniere dalle survoler pour modifier le style
      oldDallesSelect = selectedFeature;
    });

    map.addInteraction(selectInteraction);
  }
};

/**
 * Ajoute une interaction de zoom à la carte.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche sur laquelle appliquer l'interaction.
 * @param zoomToGo - Le niveau de zoom à atteindre.
 */
export const addZoomInteraction = (map: Map, layer: any, zoomToGo: number) => {
  map.on("singleclick", (event) => {
    const feature = map.forEachFeatureAtPixel(
      event.pixel,
      (feature, layerCandidate) => {
        return layerCandidate === layer ? feature : null;
      }
    );
    if (feature) {
      const geometry = feature.getGeometry(); // on vérifie qu'on a une géométrie pour zoomer dessus
      if (!geometry) return;
      const extent = getCenter(geometry.getExtent());
      const view = map.getView();
      view.animate({zoom:zoomToGo,duration:1000,anchor:extent})
      // view.fit(extent, {
      //   duration: 1000,
      //   easing: easeOut,
      //   maxZoom: zoomToGo,
      // });
    }
  });
};



export const addSelectedProduitInteraction = (
  map: Map,
  selectionLayer: any,
  isProduitSelected: any,
  addProduit: any,
  removeProduit: any,
  downloadUrl: string
) => {
  map.on("singleclick", function (event) {
    const pixel = event.pixel;
    let index = 0;
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (index === 0) {
        if (layer.getMaxZoom() === 16) {
          console.log(feature.getProperties());
            handleFeatureClick(
              feature.getProperties().name,
              feature.getProperties().url,
              feature.getProperties().id,
              isProduitSelected,
              addProduit,
              removeProduit
            );

          centerOnFeatureSmooth(map, feature);
          index += 1;
          selectionLayer.changed();
        }
      }

    });
  });
};

const handleFeatureClick = (
  dalleName: string,
  dalleUrl: string,
  dalleId: string,
  isProduitSelected: any,
  addProduit: any,
  removeProduit: any
) => {
  const dalle = { name: dalleName, url: dalleUrl, id: dalleId };

  if (!isProduitSelected(dalle.id)) {
    addProduit(dalle);
  } else {
    removeProduit(dalle.id);
  }
};

/**
 * Centre la carte de manière smooth sur la dalle sélectionnée
 * @param map - Instance de la carte OpenLayers
 * @param feature - Feature de type dalle
 * @param zoomLevel - Niveau de zoom cible (facultatif)
 */
const centerOnFeatureSmooth = (map: Map, feature: any, zoomLevel?: number) => {
  const geometry = feature.getGeometry();

  const center = getCenter(geometry.getExtent());

  map.getView().animate({
    center: center,
    zoom: zoomLevel ?? map.getView().getZoom(),
    duration: 500, // 0.5 seconde
  });
};
