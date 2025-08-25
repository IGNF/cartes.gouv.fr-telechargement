import { Map } from "ol";
import { Interaction } from "ol/interaction";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle } from "../Maps/style";
import { Layer } from "ol/layer";

/**
 * Interaction de survol (hover) pour les entités d'une couche vectorielle.
 */
export class HoveredInteraction extends Interaction {
  private map: Map;
  private vectorLayer: Layer<any>;
  private isSelected: (id: string | number | undefined) => boolean;
  private oldDallesSelect: FeatureLike | null = null;

  constructor(
    map: Map,
    vectorLayer: Layer<any>,
    isSelected: (id: string | number | undefined) => boolean
  ) {
    super();
    this.map = map;
    this.vectorLayer = vectorLayer;
    this.isSelected = isSelected;

    this.init();
  }

  /**
   * Initialise l'interaction de survol.
   */
  private init() {
    this.map.on("pointermove", (event) => {
      const pixel = this.map.getEventPixel(event.originalEvent);
      const feature = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        return layer === this.vectorLayer ? feature : null;
      });
      

      // Gestion du style lorsqu'on quitte une entité survolée
      if (this.oldDallesSelect && this.oldDallesSelect !== feature) {
        const isCurrentlySelected = this.isSelected(this.oldDallesSelect.getId());
        if (!isCurrentlySelected) {
          // Si l'entité n'est pas sélectionnée, on remet le style par défaut
          (this.oldDallesSelect as any)?.setStyle(undefined);
        } else {
          // Si l'entité est sélectionnée, on applique le style "selected"
          (this.oldDallesSelect as any)?.setStyle(getStyleForDalle("selected"));
        }
      }

      // Mise à jour du style de l'entité survolée
      if (feature) {
        (feature as any)?.setStyle(getStyleForDalle("hovered"));
      }

      // Mise à jour de la dernière entité survolée
      this.oldDallesSelect = feature ?? null;
    });
  }
}