import { GeoportalZoom, LayerImport, SearchEngineAdvanced, SearchEngineGeocodeIGN, Territories } from "geopf-extensions-openlayers";
import searchResultPinUrl from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/map-pin-2-fill.svg?url";
import { ScaleLine } from "ol/control";
import IconGeolocationSVG from "../../assets/geolocation.svg";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export type GeoportalZoomOptions = ConstructorParameters<typeof GeoportalZoom>[0];
export type TerritoriesOptions = ConstructorParameters<typeof Territories>[0];
export type ScaleLineOptions = ConstructorParameters<typeof ScaleLine>[0];

export const geoportalZoomOptions: GeoportalZoomOptions = {
  position: "bottom-right",
};

export const territoriesOptions: TerritoriesOptions = {
  collapsed: true,
  draggable: true,
  position: "bottom-left",
  panel: true,
  auto: true,
  thumbnail: false,
  reduce: false,
  tiles: 3,
};

export const scaleLineOptions: ScaleLineOptions = {};

export type LayerImportOptions = ConstructorParameters<typeof LayerImport>[0] & {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  gutter?: boolean;
  listable?: boolean;
};

export type SearchEngineOptions = ConstructorParameters<typeof SearchEngineAdvanced>[0]
  & ConstructorParameters<typeof SearchEngineGeocodeIGN>[0] & {
    id?: string;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };

export const searchEngineOptions: SearchEngineOptions = {
  id: "1",
  position: "top-left",
  collapsed: false,
  collapsible: false,
  returnTrueGeometry: true,
  selectGeometry: "extent",
  autocompleteOptions: {
    serviceOptions: { maximumResponses: 10 },
    prettifyResults: true,
    maximumEntries: 5,
  },
  markerUrl: IconGeolocationSVG,
  placeholder: "Rechercher un lieu...",
};

// Reprend le style du résultat sélectionné dans SearchEngineAdvanced.
const importedFeatureColor = "#910000";
const importedLayerStyle = new Style({
  image: new Icon({
    src: searchResultPinUrl,
    color: importedFeatureColor,
    anchor: [0.5, 1],
  }),
  stroke: new Stroke({ color: importedFeatureColor, lineDash: [8, 8], width: 2 }),
  fill: new Fill({ color: "rgba(145, 0, 0, 0.2)" }),
});

export const layerImportOptions: LayerImportOptions = {
  id: 20,
  position: "top-right",
  gutter: true,
  listable: true,
  dragAndDropUI: true,
  title: "Importer une emprise",
  layerTypes: ["GeoJSON", "KML"],
  vectorStyleOptions: {
    GeoJSON: { defaultStyle: importedLayerStyle },
    KML: { extractStyles: false, defaultStyle: importedLayerStyle },
  },
};