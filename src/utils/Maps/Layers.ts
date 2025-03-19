import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { getStyleForBlocs, getStyleForDalle } from "./style";

/**
 * Crée et retourne toutes les couches nécessaires pour la carte.
 */
export const createWFSLayersDalle = (
  wfsUrl: string,
  typeName: string,
  selectedDalles: any,
  isDalleSelected:any,
  minZoom?: number,
  maxZoom?: number
) => {
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
    style: function (feature) {

      return isDalleSelected(feature.getId())
        ? getStyleForDalle("selected") // Style pour les entités sélectionnées
        : getStyleForDalle("default"); // Style par défaut pour les autres
    },
    // TODO: faire en sorte que le zoom soit pris du filtre
    minZoom: minZoom, // La couche sera visible à partir du niveau de zoom 7
    maxZoom: maxZoom, // La couche sera visible jusqu'au niveau de zoom 11
  });
};

export const createWFSLayersBloc = (
  wfsUrl: string,
  typeName: string,
  minZoom?: number,
  maxZoom?: number
) => {
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
      return getStyleForBlocs(feature);
    },
    // TODO: faire en sorte que le zoom soit pris du filtre
    minZoom: minZoom, // La couche sera visible à partir du niveau de zoom 7
    maxZoom: maxZoom, // La couche sera visible jusqu'au niveau de zoom 11
  });
};
