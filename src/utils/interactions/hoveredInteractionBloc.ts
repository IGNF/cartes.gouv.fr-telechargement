import { Interaction } from "ol/interaction";
import Overlay from "ol/Overlay";
import Map from "ol/Map";
import { FeatureLike } from "ol/Feature";
import { Pixel } from "ol/pixel";
import { Coordinate } from "ol/coordinate";
import VectorTileLayer from "ol/layer/VectorTile";

interface HoverPopupOptions {
  layer: VectorTileLayer;
  element?: HTMLElement;
}

export default class HoverPopupInteraction extends Interaction {
  private map: Map | null = null;
  private layer: VectorTileLayer;
  private popupElement: HTMLElement;
  private overlay: Overlay;

  constructor(options: HoverPopupOptions) {
    super();

    this.layer = options.layer;
    this.popupElement = options.element || this.createPopupElement();

    this.overlay = new Overlay({
      element: this.popupElement,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });
  }

  public override setMap(map: Map | null): void {
    super.setMap(map);
    if (map) {
      this.map = map;
      map.addOverlay(this.overlay);
    } else {
      this.map = null;
    }
  }

  public override handleEvent(event: any): boolean {
    if (!this.map || !this.layer) return true;

    if (event.type === "pointermove") {
      let found = false;

      this.map.forEachFeatureAtPixel(
        event.pixel as Pixel,
        (feature: FeatureLike, layerCandidate) => {
          if (layerCandidate === this.layer) {
            const name =
              (feature.get("name") as string) ||
              (feature.get("nom") as string) ||
              "Sans nom";

            this.popupElement.innerHTML = name;
            this.popupElement.style.display = "block";
            this.overlay.setPosition(event.coordinate as Coordinate);

            found = true;
          }
        },
        {
          layerFilter: (layerCandidate) => layerCandidate === this.layer,
        }
      );

      if (!found) {
        this.popupElement.style.display = "none";
      }
    }

    return true; // important : ne bloque pas les autres interactions
  }

  private createPopupElement(): HTMLElement {
    const div = document.createElement("div");
    div.className = "hover-popup";
    div.style.display = "none";
    div.style.padding = "4px 8px";
    div.style.background = "white";
    div.style.border = "1px solid black";
    div.style.borderRadius = "4px";
    div.style.fontSize = "12px";
    return div;
  }
}
