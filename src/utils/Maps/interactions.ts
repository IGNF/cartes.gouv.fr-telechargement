import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle } from "./style";
import { Select } from "ol/interaction";
import { click, platformModifierKeyOnly } from "ol/events/condition";
import { easeOut } from "ol/easing";
import { useEffect } from "react";
import { useDalleStore } from "../../hooks/Store/useDalleStore";
import VectorLayer from "ol/layer/Vector";

/**
 * Génère un style OpenLayers basé sur le type d'interaction ou d'état.
 *
 * @param type - Le type de style à appliquer, correspondant à une clé dans `styleDalle`.
 *               Exemple : "select" ou "pointer_move_dalle_menu".
 * @returns Un objet `Style` configuré pour OpenLayers.
 */

let addHoveredInteractionDone = false;
export const addHoveredInteraction = (map: Map, vectorLayer: VectorLayer) => {
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
      if (selectedFeature.get("selected")) {
        selectedFeature.setStyle(getStyleForDalle("selected"));
      }
      // quand on quitte la dalle survolé
      if (event.deselected.length > 0) {
        if (oldDallesSelect !== null) {
          var selected = oldDallesSelect.get("selected");
          if (!selected) {
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
  } else {
    console.log("addHoveredInteraction CANCEL");
  }
};

/**
 * Ajoute une interaction de zoom à la carte.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche sur laquelle appliquer l'interaction.
 * @param zoomToGo - Le niveau de zoom à atteindre.
 */
export const addZoomInteraction = (
  map: Map,
  layer: VectorLayer,
  zoomToGo: number
) => {
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
  layer: VectorLayer,
  handleFeatureClick: any
) => {
  const selectInteraction = new Select({
    condition: function (event) {
      return click(event) && !platformModifierKeyOnly(event);
    },
    // Sélection au clic
    layers: [layer], // Applique la sélection uniquement à cette couche
  });

  // Gestion de l'événement de sélection
  selectInteraction.on("select", (event) => {
    console.log(event);
    
    handleFeatureClick(
      event.selected[0].getProperties().name,
      event.selected[0].getProperties().url,
      event.selected[0].getId(),
    );
  });

  map.addInteraction(selectInteraction);

  return selectInteraction; // Retourne l'interaction pour un éventuel nettoyage
};


/**
 * Met à jour le style des features d'une couche vectorielle
 * lorsque le store Zustand change.
 */
export const useForceUpdateLayer = (vectorLayer: VectorLayer) => {
  const selectedDalles = useDalleStore((state) => state.selectedDalles);
  console.log(selectedDalles)

  useEffect(() => {
    if (!vectorLayer) return;
    console.log('hello there')
    vectorLayer.getSource()?.changed(); // Force OpenLayers à redessiner les features
    vectorLayer.changed(); // Rafraîchit toute la couche
  }, [selectedDalles, vectorLayer]);
};
