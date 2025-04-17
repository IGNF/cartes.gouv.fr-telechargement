import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle } from "./style";
import { Select } from "ol/interaction";
import { click, platformModifierKeyOnly } from "ol/events/condition";
import { easeOut } from "ol/easing";
import { getCenter } from "ol/extent";

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
      const extent = geometry.getExtent();
      const view = map.getView();
      view.fit(extent, {
        duration: 1000,
        easing: easeOut,
        maxZoom: zoomToGo,
      });
    }
  });
};

/**
 * Ajoute une interaction de sélection à une carte OpenLayers.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche vectorielle sur laquelle appliquer la sélection.
 * @param setSelectedDalles - Fonction pour mettre à jour les dalles sélectionnées.
 */
export const addSelectedInteraction = (
  map: Map,
  layer: any,
  handleFeatureClick: any
) => {
  const selectInteraction = new Select({
    condition: function (event) {
      return click(event) && !platformModifierKeyOnly(event);
    },
    layers: [layer], // Applique la sélection uniquement à cette couche
  });

  // Gestion de l'événement de sélection
  selectInteraction.on("select", (event) => {
    handleFeatureClick(
      event.selected[0].getProperties().name,
      event.selected[0].getProperties().url,
      event.selected[0].getId()
    );
  });

  map.addInteraction(selectInteraction);

  return selectInteraction; // Retourne l'interaction pour un éventuel nettoyage
};

export const addTileClickInteractionTMS = (
  map: Map,
  selectionLayer: any,
  isProduitSelected: any,
  addProduit: any,
  removeProduit: any
) => {
  map.on("singleclick", function (event) {
    const pixel = event.pixel;
    let index = 0;
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (index === 0) {
        if (layer.getMaxZoom() === 16) {
          handleFeatureClick(
            feature.getProperties().name,
            feature.getProperties().name_chantier,
            feature.getProperties().name,
            isProduitSelected,
            addProduit,
            removeProduit
          );

          centerOnFeatureSmooth(map, feature);
          index += 1;
          selectionLayer.changed();
        }
      }

      console.log("index", index);
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

  if (!isProduitSelected(dalle.name)) {
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
const centerOnFeatureSmooth = (
  map: Map,
  feature: any,
  zoomLevel?: number
) => {
  const geometry = feature.getGeometry();

  const center = getCenter(geometry.getExtent());

  map.getView().animate({
    center: center,
    zoom: zoomLevel ?? map.getView().getZoom(),
    duration: 500, // 0.5 seconde
  });
};
