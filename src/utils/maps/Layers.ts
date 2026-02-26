
import VectorTileSource from 'ol/source/VectorTile.js';
import MVT from "ol/format/MVT.js";



export const tmsSource = (produit:string,maxZoom?: number) => {
  return  new VectorTileSource({
      maxZoom: maxZoom,
      format: new MVT(),
      url: produit,
    });
};




