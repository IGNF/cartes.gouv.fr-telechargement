import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { getStyleForBlocs, getStyleForDalle } from "./style";
import { XYZ } from "ol/source";

import VectorTileSource from 'ol/source/VectorTile.js';
import VectorTileLayer from "ol/layer/VectorTile";
import MVT from "ol/format/MVT.js";



export const tmsLayer = (produit:string,maxZoom?: number) => {
  return new VectorTileLayer({
    maxZoom: maxZoom,
    source: new VectorTileSource({
      maxZoom: maxZoom,
      format: new MVT(),
      url: produit,
    }),
  });
};




