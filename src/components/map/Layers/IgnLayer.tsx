import { useMap } from 'react-openlayers';
import { useEffect } from 'react';
import { LayerWMTS } from 'geopf-extensions-openlayers';

    export function IgnLayer({ layerName }: { layerName: string }) {

  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    map.addLayer(new LayerWMTS({
      layer: layerName,
    }));
  }, [map]);
  return null;
    }

