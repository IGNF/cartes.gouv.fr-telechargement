import { useEffect } from "react";
import { Draw } from "ol/interaction";
import { createBox } from "ol/interaction/Draw";
import { VectorLayer } from "ol/layer";
import Map from "ol/Map";

/**
 * Hook personnalisé pour gérer les interactions de dessin sur une carte OpenLayers.
 * @param map - Instance de la carte OpenLayers.
 * @param drawnPolygonsLayer - La couche où les polygones dessinés seront ajoutés.
 * @returns Les interactions de dessin.
 */
export const useInteractions = (
  map: Map | null,
  drawnPolygonsLayer: VectorLayer
) => {
  useEffect(() => {
    if (!map) return;

    // Création des interactions de dessin
    const drawPolygon = new Draw({ type: "Polygon" });
    const drawRectangle = new Draw({
      type: "Circle",
      geometryFunction: createBox(),
    });

    // Gestion de l'événement "drawend" pour chaque interaction
    const onDrawEnd = (event: any, type: string) => {
      const feature = event.feature;
      const id = `${type}-${feature
        .getGeometry()
        .getExtent()
        .map((point) => Math.round(point / 1000))
        .join("-")}`;
      feature.setProperties({ id });
      drawnPolygonsLayer.getSource().addFeature(feature);
    };

    drawPolygon.on("drawend", (event) => onDrawEnd(event, "polygon"));
    drawRectangle.on("drawend", (event) => onDrawEnd(event, "rectangle"));

    // Ajouter les interactions à la carte
    map.addInteraction(drawPolygon);
    map.addInteraction(drawRectangle);

    // Nettoyage des interactions lors du démontage
    return () => {
      map.removeInteraction(drawPolygon);
      map.removeInteraction(drawRectangle);
    };
  }, [map, drawnPolygonsLayer]);

  return { drawPolygon, drawRectangle };
};
