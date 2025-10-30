
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




