import { PointerInteraction } from 'react-openlayers';
import { MapBrowserEvent } from "ol";

export function SelectVectorLayerInteraction({ vectorTileClickEventHandler, layerId }: { 
    vectorTileClickEventHandler: vectorTileClickEventHandler,
    layerId: string 
    }) {

    const handleEvent = (event:  MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>) => {
        if (event.type === 'click') {
            console.log("hello");
            
            vectorTileClickEventHandler(event, layerId);
        }
        return true;
    }

  return (
        <PointerInteraction
                key={layerId + '-select'}
                handleEvent={handleEvent}
        />
    );
    }

