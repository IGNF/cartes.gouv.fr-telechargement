import { Map } from "ol";
import {  getCenter } from "ol/extent";



export const interaction = (map: Map)=>{
  map.addInteraction()
}



/**
 * Ajoute une interaction de zoom à la carte.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche sur laquelle appliquer l'interaction.
 * @param zoomToGo - Le niveau de zoom à atteindre.
 */
export const addZoomInteraction = (map: Map, layer: any, zoomToGo: number) => {
  map.on("singleclick", (event) => {
    const feature = map.forEachFeatureAtPixel(
      event.pixel,
      (feature, layerCandidate) => {
        return layerCandidate === layer ? feature : null;
      }
    );
    if (feature) {
      const geometry = feature.getGeometry(); // on vérifie qu'on a une géométrie pour zoomer dessus
      if (!geometry) return;
      const extent = getCenter(geometry.getExtent());
      const view = map.getView();
      view.animate({zoom:zoomToGo,duration:1000,anchor:extent})
      // view.fit(extent, {
      //   duration: 1000,
      //   easing: easeOut,
      //   maxZoom: zoomToGo,
      // });
    }
  });
};


