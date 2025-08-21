import { Map } from "ol";
import { Interaction } from "ol/interaction";
import { FeatureLike } from "ol/Feature";
import { Layer } from "ol/layer";
import { getCenter } from "ol/extent";

/**
 * Interaction de sélection par clic pour les entités d'une couche vectorielle.
 */
export class SelectedClickInteraction extends Interaction {
  private map: Map;
  private selectionLayer: Layer<any>;
  private zoomToGo: number;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit: (id: string | number | undefined) => void;

  constructor(
    map: Map,
    selectionLayer: Layer<any>,
    zoomToGo: number = 10,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit: (id: string | number | undefined) => void
  ) {
    super();
    this.map = map;
    this.selectionLayer = selectionLayer;
    this.zoomToGo = zoomToGo;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;


    this.init();
  }

  /**
   * Initialise l'interaction de sélection par clic.
   */
  private init() {
    this.map.on("singleclick", (event) => {
        
      const pixel = this.map.getEventPixel(event.originalEvent);
      let index = 0;
      

      this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {

        
        if (index!=1 && layer.getSource()["key_"] === this.selectionLayer.getSource()["key_"]) {

          const properties = feature.getProperties();
          const dalle = {
            name: properties.name,
            url: properties.url,
            id: properties.id,
          };

          if (!this.isProduitSelected(dalle.name)) {
            this.addProduit(dalle);
          } else {
            console.log(`Produit déjà sélectionné: ${dalle.name}`);
            
            this.removeProduit(dalle.name);
          }

          this.centerOnFeature(feature);
          this.selectionLayer.changed();
          index += 1;
        }
      });
    });
  }

  /**
   * Centre la carte sur une entité de manière fluide.
   * @param feature - L'entité sur laquelle centrer la carte.
   */
  private centerOnFeature(feature: FeatureLike) {
    const geometry = feature.getGeometry();
    if (!geometry) return;


  const center = getCenter(geometry.getExtent());

    this.map.getView().animate({
      center: center,
      zoom: this.map.getView().getZoom(),
      duration: 500, // 0.5 seconde
    });
  }
}