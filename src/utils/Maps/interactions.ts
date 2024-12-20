import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle } from "./style";

/**
 * Génère un style OpenLayers basé sur le type d'interaction ou d'état.
 *
 * @param type - Le type de style à appliquer, correspondant à une clé dans `styleDalle`.
 *               Exemple : "select" ou "pointer_move_dalle_menu".
 * @returns Un objet `Style` configuré pour OpenLayers.
 */
export const addHovers = (map: Map) => {

  
  // Détecter le survol et changer le style
  let highlightedFeature: FeatureLike | null = null;
  map.on("pointermove", function (event) {
    // Vérifier si l'événement de survol touche une features
    const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
      return feature;
    });

    if (feature) {
      // Si une features est survolée, appliquer le style de survol
      if (highlightedFeature !== feature) {
        // Rétablir le style précédent pour l'ancienne features survolée
        if (highlightedFeature) {
          highlightedFeature.setStyle(getStyleForDalle('default'));
        }
        highlightedFeature = feature;
        feature.setStyle(getStyleForDalle('hoverStyle')); // Appliquer le style de survol
      }
    } else {
      // Si aucune features n'est survolée, réinitialiser le style
      if (highlightedFeature) {
        highlightedFeature.setStyle(getStyleForDalle('default'));
        highlightedFeature = null;
      }
    }
  });
};
