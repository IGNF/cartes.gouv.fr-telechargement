import { Interaction } from "ol/interaction";
import { MapBrowserEvent } from "ol";
import { Layer } from "ol/layer";
import { Dalle } from "../../assets/@types/types";

export class SelectedClickInteraction extends Interaction {
  private selectionLayer: Layer<any>;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: Dalle) => void;
  private removeProduit: (id: string | number | undefined) => void;
  private setIsMetadata: (value: boolean) => void;
  private addHistoricStep: (item: any) => void;

  constructor(
    selectionLayer: Layer<any>,
    _zoomToGo: number,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: Dalle) => void,
    removeProduit: (id: string | number | undefined) => void,
    setIsMetadata: (value: boolean) => void,
    addHistoricStep: (item: any) => void,
  ) {
    super();
    this.selectionLayer = selectionLayer;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;
    this.setIsMetadata = setIsMetadata;
    this.addHistoricStep = addHistoricStep;
  }

  public override handleEvent(
    event: MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>,
  ): boolean {
    if (event.type !== "click") return true;

    const pixel = event.map.getEventPixel(event.originalEvent);
    event.map.forEachFeatureAtPixel(pixel, (feature) => {
      const properties = feature.getProperties();
      if (properties.metadata !== undefined) this.setIsMetadata(true);

      const dalle: Dalle = {
        name: properties.name,
        url: properties.url,
        id: properties.id,
        timestamp: new Date(properties.timestamp).getTime(),
        metadata: properties.metadata,
      };

      if (this.isProduitSelected(dalle.id)) {
        this.removeProduit(dalle.id);
        this.addHistoricStep([{ action: "remove", dalles: [dalle] }]);
      } else {
        this.addProduit(dalle);
        this.addHistoricStep([{ action: "add", dalles: [dalle] }]);
      }

      return true;
    }, {
      layerFilter: (layer) => layer === this.selectionLayer,
    });

    return true;
  }
}
