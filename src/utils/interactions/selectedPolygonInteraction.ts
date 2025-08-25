import { Map } from "ol";
import { Interaction } from "ol/interaction";
import { Draw } from "ol/interaction";
import { FeatureLike } from "ol/Feature";
import { Vector as VectorSource } from "ol/source";
import { bboxPolygon, booleanIntersects } from "@turf/turf";
import GeoJSON from "ol/format/GeoJSON";
import { Polygon } from "ol/geom";

/**
 * Interaction de sélection par polygone pour les entités d'une couche vectorielle.
 */
export class SelectedPolygonInteraction extends Interaction {
  private drawInteraction: Draw;
  private selectionLayer: any;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit: (id: string | number | undefined) => void;

  constructor(
    selectionLayer: any,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit: (id: string | number | undefined) => void
  ) {
    super();
    this.selectionLayer = selectionLayer;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;

    // Initialise l'interaction de dessin
    this.drawInteraction = new Draw({
      source: new VectorSource(), // Source temporaire pour le polygone dessiné
      type: "Polygon",
    });

    this.init();
  }

  /**
   * Initialise l'interaction de sélection par polygone.
   */
  private init() {
    this.drawInteraction.on("drawend", (event) => {
      const extent = event.feature.getGeometry()?.getExtent();
      const format = new GeoJSON();

      // Parcourt les entités dans l'étendue du polygone dessiné
      this.selectionLayer.getFeaturesInExtent(extent).forEach((feature) => {
        const featureExtent = feature.getGeometry().getExtent();
        const coords = [
          [
            [featureExtent[0], featureExtent[1]],
            [featureExtent[0], featureExtent[3]],
            [featureExtent[2], featureExtent[3]],
            [featureExtent[2], featureExtent[1]],
            [featureExtent[0], featureExtent[1]], // Retour au point initial
          ],
        ];

        // Crée une géométrie Polygon OL
        const polygon = new Polygon(coords);

        // Vérifie si le polygone dessiné intersecte l'entité
        if (
          booleanIntersects(
            format.writeGeometryObject(polygon.getSimplifiedGeometry()),
            format.writeGeometryObject(event.feature.getGeometry())
          )
        ) {
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
      });

      // Rafraîchit la couche de sélection
      this.selectionLayer.getSource().changed();
    });
  }

  /**
   * Retourne l'interaction de dessin.
   */
  public getDrawInteraction(): Draw {
    return this.drawInteraction;
  }
}
