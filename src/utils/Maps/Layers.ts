import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style } from "ol/style";
import { format } from "ol/coordinate";
import { getStyleForDalle } from "./interactions";

/**
 * Crée un style générique pour une couche vectorielle.
 * @param fillColor Couleur de remplissage
 * @param strokeColor Couleur de contour
 * @param strokeWidth Épaisseur du contour
 */
export const createStyle = (
  fillColor: string,
  strokeColor: string = "black",
  strokeWidth: number = 0.5
) =>
  new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
  });

/**
 * Crée une couche vectorielle avec une source donnée.
 * @param source Source vectorielle
 * @param style Style à appliquer
 */
export const createVectorLayer = (source: VectorSource, style: Style) =>
  new VectorLayer({
    source,
    style,
  });

/**
 * Crée et retourne toutes les couches nécessaires pour la carte.
 */
export const createWFSLayers = (wfsUrl: string, typeName: string) => {
  const styleDalle = { select: { fill: new Fill({ color: "#20bf0a", }), stroke: new Stroke({ color: "rgba(112, 119, 122)", width: 2, }), }, pointer_move_dalle_menu: { fill: new Fill({ color: "#e8f54a", }), stroke: new Stroke({ color: "black", width: 2, }), }, }

  
  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return (
        `${wfsUrl}?` +
        `service=WFS&version=2.0.0&apikey=interface_catalogue&request=GetFeature&typeNames=${typeName}` +
        `&outputFormat=application/json&bbox=${extent.join(",")},EPSG:3857`
      );
    },
    strategy: (extent) => [extent], // Charger les entités visibles dans la vue actuelle
  });

  return new VectorLayer({
    source: vectorSource,
    style: (feature) => {
      const isSelected = feature.get("selected"); // Exemple de propriété
      return isSelected
        ? getStyleForDalle("pointer_move_dalle_menu")
        : getStyleForDalle("select");
    },
  });
};
