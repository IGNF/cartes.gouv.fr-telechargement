import { Map } from "ol";
import { Interaction } from "ol/interaction";
import { Draw } from "ol/interaction";
import { FeatureLike } from "ol/Feature";
import { Vector as VectorSource } from "ol/source";
import { bboxPolygon, booleanIntersects, intersect, pointsWithinPolygon } from "@turf/turf";
import GeoJSON from "ol/format/GeoJSON";
import { Polygon } from "ol/geom";

/**
 * Interaction de sélection par polygone pour les entités d'une couche vectorielle.
 */
export class SelectedPolygonInteraction extends Interaction {
  private map: Map;
  private selectionLayer: any;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit: (id: string | number | undefined) => void;

  constructor(
    map: Map,
    selectionLayer: any,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit: (id: string | number | undefined) => void
  ) {
    super();
    this.map = map;
    this.selectionLayer = selectionLayer;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;

    this.init();
  }

  /**
   * Initialise l'interaction de sélection par polygone.
   */
  private init() {
    const drawInteraction = new Draw({
      source: new VectorSource(), // Source temporaire pour le polygone dessiné
      type: "Polygon",
    });

    drawInteraction.on("drawend", (event) => {
      const extent = event.feature.getGeometry()?.getExtent();
      const format = new GeoJSON();

      this.selectionLayer.getFeaturesInExtent(extent).forEach((feature) => {

        const extent = feature.getGeometry().getExtent();
        const coords = [
          [
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[3]],
            [extent[2], extent[1]],
            [extent[0], extent[1]], // retour au point initial
          ]
        ];
        
        // crée une géométrie Polygon OL
        const polygon = new Polygon(coords);

        console.log("feature properties:", polygon);
        
        console.log("intersect result:" , booleanIntersects(format.writeGeometryObject(polygon.getSimplifiedGeometry()), format.writeGeometryObject(event.feature.getGeometry())));
        if (booleanIntersects(format.writeGeometryObject(polygon.getSimplifiedGeometry()), format.writeGeometryObject(event.feature.getGeometry()))) {
          const properties = feature.getProperties(); 
    
          const dalle = {
            name: properties.name,
            url: properties.url,
            id: properties.id,
          };
    
          if (!this.isProduitSelected(dalle.name)) {
            this.addProduit(dalle);
          }

        }
        })
      ;

      // Ajoute ou retire les entités sélectionnées
      //   selectedFeatures.forEach((feature) => {
      //     const properties = feature.getProperties();

      //   });

      // Rafraîchit la couche de sélection
      this.selectionLayer.getSource().changed();
    });

    // Ajoute l'interaction de dessin à la carte
    this.map.addInteraction(drawInteraction);

    drawInteraction.setActive(false);
    this.map.getView().on("change:resolution", () => {
      const zoom = this.map.getView().getZoom();
      if (zoom >= 11) {
        drawInteraction.setActive(true);
      }
      else {
        drawInteraction.setActive(false);
      }
    });
  }
}
