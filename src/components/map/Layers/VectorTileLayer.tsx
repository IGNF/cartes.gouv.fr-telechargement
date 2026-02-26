import { Map as OlMap } from 'ol';
import { useEffect, useRef } from 'react';
import olVectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile'; // Import the base TileSource type
import { Options as VectorTileLayerOptions } from 'ol/layer/VectorTile'; // Still import Options
import { useMap } from 'react-openlayers';
import useDalleStore from "../../../hooks/store/useDalleStore";

interface VectorTileLayerProps extends VectorTileLayerOptions<VectorTileSource> {
  name?: string;
}

export function VectorTileLayer(props: VectorTileLayerProps) {
  const map = useMap();
  const layerRef = useRef(new olVectorTileLayer(props)); // single instance
  const addLayer = useDalleStore((state) => state.addLayer);

  useEffect(() => {
    if (!map) return;

    const layer = layerRef.current; // same instance every time
    if (props.name) {
      layer.set('name', props.name);
    }
    map.addLayer(layer);
    addLayer(layer)

    return () => {
          map.removeLayer(layer);
    };
  }, [map, props]);

  return null;
}