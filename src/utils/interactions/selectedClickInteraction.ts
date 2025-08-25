import { Interaction } from "ol/interaction";
import { FeatureLike } from "ol/Feature";
import { Layer } from "ol/layer";
import { MapBrowserEvent } from "ol";
import { getCenter } from "ol/extent";

/**
 * Interaction de sélection par clic pour les entités d'une couche vectorielle.
 */
export class SelectedClickInteraction extends Interaction {
  private selectionLayer: Layer<any>;
  private zoomToGo: number;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit: (id: string | number | undefined) => void;

  constructor(
    selectionLayer: Layer<any>,
    zoomToGo: number = 10,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit: (id: string | number | undefined) => void
  ) {
    super();
    this.selectionLayer = selectionLayer;
    this.zoomToGo = zoomToGo;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;

    // Ajout de l'événement de clic
    this.handleEvent = this.handleClickEvent.bind(this);
  }

  /**
   * Gère l'événement de clic pour la sélection.
   * @param event - L'événement de clic de la carte.
   * @returns {boolean} - Retourne `true` pour continuer la propagation de l'événement.
   */
  private handleClickEvent(event: MapBrowserEvent<MouseEvent>): boolean {
    // Vérifie que l'événement est un clic
    if (event.type !== "click") {
      return true; // Continue la propagation pour les autres types d'événements
    }

    const map = event.map;
    const pixel = map.getEventPixel(event.originalEvent);
    let index = 0;

    // Parcourt les entités sous le clic
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      if (
        index === 0 &&
        layer?.getSource()["key_"] === this.selectionLayer.getSource()["key_"]
      ) {
        const properties = feature.getProperties();
        const dalle = {
          name: properties.name,
          url: properties.url,
          id: properties.id,
        };

        // Ajoute ou retire le produit en fonction de son état
        if (!this.isProduitSelected(dalle.name)) {
          this.addProduit(dalle);
        } else {
          this.removeProduit(dalle.name);
        }

        // Centre la carte sur l'entité sélectionnée
        this.centerOnFeature(map, feature);

        // Rafraîchit la couche de sélection
        this.selectionLayer.changed();
        index += 1;
      }
    });

    return true; // Continue la propagation de l'événement
  }

  /**
   * Centre la carte sur une entité de manière fluide.
   * @param map - L'instance de la carte.
   * @param feature - L'entité sur laquelle centrer la carte.
   */
  private centerOnFeature(map: any, feature: FeatureLike) {
    const geometry = feature.getGeometry();
    if (!geometry) return;

    const center = getCenter(geometry.getExtent());

    map.getView().animate({
      center: center,
      zoom: this.zoomToGo,
      duration: 500, // 0.5 seconde
    });
  }
}