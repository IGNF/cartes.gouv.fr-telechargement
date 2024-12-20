import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style } from "ol/style";
import { format } from "ol/coordinate";
import { getStyleForDalle } from "./style";

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
export const createWFSLayersDalle = (wfsUrl: string, typeName: string,minZoom?:number,maxZoom?:number) => {

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
        ? getStyleForDalle("selected")
        : getStyleForDalle("default");
    },
    // TODO: faire en sorte que le zoom soit pris du filtre
    minZoom: minZoom, // La couche sera visible à partir du niveau de zoom 7
    maxZoom: maxZoom, // La couche sera visible jusqu'au niveau de zoom 11
  });
};

export const createWFSLayersBloc = (wfsUrl: string, typeName: string,minZoom?:number,maxZoom?:number) => {


  const vectorSourceBloc = new VectorSource({
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
    source: vectorSourceBloc,
    style: (feature) => {
      const isSelected = feature.get("selected"); // Exemple de propriété
      return isSelected
        ? getStyleForDalle("selected")
        : getStyleForDalle("default");
    },
    // TODO: faire en sorte que le zoom soit pris du filtre
    minZoom: minZoom, // La couche sera visible à partir du niveau de zoom 7
    maxZoom: maxZoom, // La couche sera visible jusqu'au niveau de zoom 11
  });
};
