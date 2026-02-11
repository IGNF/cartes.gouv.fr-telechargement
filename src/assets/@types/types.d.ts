import { MapBrowserEvent } from "ol";
import { StyleLike } from "ol/style/Style";

declare global {

type Dalle = {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  metadata?: Record<string, any>;
  isHovered?: boolean;
};

type FilterDate = { dateStart: number | null; dateEnd: number };


type DownloadFile = { url: string; name: string };


/**
 * Type pour les VectorTile Layer
 */
 type MapEvent = MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>;
 type VectorTileLayerConf = {
    url: string;
    maxZoom: number;
    properties: { id: string };
    style?: StyleLike;
    selectInteraction?: vectorTileClickEventHandler;
  };

 type vectorTileClickEventHandler = (event: MapEvent, layerId: string) => boolean;
}



export {};