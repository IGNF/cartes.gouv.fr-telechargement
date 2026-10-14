import { GeoportalZoom, LayerImport, SearchEngineAdvanced, SearchEngineGeocodeIGN, Territories } from "geopf-extensions-openlayers";
import { ScaleLine } from "ol/control";
import IconGeolocationSVG from "../../assets/geolocation.svg";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
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

const importedLayerStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: "#000091" }),
    stroke: new Stroke({ color: "#fff", width: 2 }),
  }),
  stroke: new Stroke({ color: "#000091", lineDash: [5, 5], width: 2 }),
  fill: new Fill({ color: "rgba(1, 1, 1, 0.3)" }),
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