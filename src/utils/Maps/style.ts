import { Style, Fill, Stroke } from "ol/style";

/**
 * Définit les styles pour les entités WFS en fonction de l'état ou de l'interaction.
 */
const styleDalle = {
  /**
   * Style appliqué par defaut.
   */
  default: {
    fill: new Fill({
      color: "#dcdcfc", // Vert clair pour indiquer une sélection
    }),
    stroke: new Stroke({
      color: "#3a3a68", // Gris pour les contours
      width: 1,
    }),
  },
  /**
   * Style appliqué lorsqu'une dalle est sélectionnée.
   */
  selected: {
    fill: new Fill({
      color: "#20bf0a", // Vert clair pour indiquer une sélection
    }),
    stroke: new Stroke({
      color: "rgba(112, 119, 122)", // Gris pour les contours
      width: 2,
    }),
  },

  /**
   * Style appliqué au survole
   */
  hoverStyle: {
    fill: new Fill({
      color: '#a7fc62'  // Couleur de remplissage verte transparente pour le survol
    }),
    stroke: new Stroke({
      color: '#35432e',  // Bordure verte pour le survol
      width: 2
    }),
  }

};


/**
 * Génère un style OpenLayers basé sur le type d'interaction ou d'état.
 *
 * @param type - Le type de style à appliquer, correspondant à une clé dans `styleDalle`.
 *               Exemple : "select" ou "pointer_move_dalle_menu".
 * @returns Un objet `Style` configuré pour OpenLayers.
 */
export const getStyleForDalle = (type: keyof typeof styleDalle): Style => {
  const config = styleDalle[type];
  return new Style({
    fill: config.fill,
    stroke: config.stroke,
  });
};
