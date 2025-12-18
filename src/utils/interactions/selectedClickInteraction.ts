import { Interaction } from "ol/interaction";
import { Layer } from "ol/layer";
import { MapBrowserEvent } from "ol";
import { getRemoteFileSize } from "../getRemoteFileSize";
import { useFilterStore } from "../../hooks/store/useFilterStore";

/**
 * Interaction de sélection par clic pour les entités d'une couche vectorielle.
 */
export class SelectedClickInteraction extends Interaction {
  private selectionLayer: Layer<any>;
  private zoomToGo: number;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit: (id: string | number | undefined) => void;
  private setIsMetadata: (v: boolean) => void;

  constructor(
    selectionLayer: Layer<any>,
    zoomToGo: number = 10,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit: (id: string | number | undefined) => void,
    setIsMetadata: (v: boolean) => void
  ) {
    super();
    this.selectionLayer = selectionLayer;
    this.zoomToGo = zoomToGo;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;
    this.setIsMetadata = setIsMetadata;
  }

  /**
   * Gère l'événement de clic pour la sélection.
   * @param event - L'événement de clic de la carte.
   * @returns {boolean} - Retourne `true` pour continuer la propagation de l'événement.
   */
  public override handleEvent(
    event: MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>
  ): boolean {
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
        layer?.getSource()["key_"] === this.selectionLayer.getSource()["key_"]
      ) {
        const properties = feature.getProperties();
        if (properties.metadata !== undefined) {
          this.setIsMetadata(true);
        }


        
        const dalle = {
          name: properties.name,
          url: properties.url,
          id: properties.id,
          size: getRemoteFileSize(properties.url),
          timestamp: properties.timestamp,
          metadata: properties.metadata,
        };
        
        // Ajoute ou retire le produit en fonction de son état
        if (!this.isProduitSelected(dalle.id) && index === 0) {
          this.addProduit(dalle);
          
          index++;
        } else {
          if (index === 0) {
            this.removeProduit(dalle.id);
            index++;
          }
        }

        // Déplace la carte de manière imperceptible
        this.moveMapImperceptibly(map);
      }
    });

    // Rafraîchit la couche de sélection
    this.selectionLayer.changed();

    return true; // Continue la propagation de l'événement
  }

  /**
   * Déplace la carte de manière imperceptible en ajustant légèrement le centre.
   * @param map - L'instance de la carte.
   */
  private moveMapImperceptibly(map: any): void {
    const view = map.getView();
    const currentCenter = view.getCenter();

    if (currentCenter) {
      // Ajoute un léger décalage au centre actuel
      const imperceptibleOffset = 0.00001; // Ajustez cette valeur si nécessaire
      const newCenter = [
        currentCenter[0] + imperceptibleOffset,
        currentCenter[1] + imperceptibleOffset,
      ];

      // Anime la vue vers le nouveau centre
      view.animate({
        center: newCenter,
        duration: 100, // Animation rapide (0.1 seconde)
      });
    }
  }
}
