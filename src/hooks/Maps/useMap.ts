// React Core
import { useCallback, useEffect, useRef, useState } from "react";

// OpenLayers Core
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get } from "ol/proj";

// Geoportal Extensions
import Gp from "geoportal-access-lib";

// Custom Utils
import { addControls } from "../../utils/Maps/controls";
import {
  createWFSLayersBloc,
  createWFSLayersDalle,
} from "../../utils/Maps/Layers";
import { addHoveredInteraction, addSelectedInteraction, addZoomInteraction } from "../../utils/Maps/interactions";
import { getStyleForDalle } from "../../utils/Maps/style";

/**
 * Custom hook to initialize and manage an OpenLayers map.
 * 
 * @param {React.RefObject<HTMLDivElement>} containerRef - The reference to the map container element.
 * @param {string} downloadUrl - The URL for downloading map data.
 * @param {Function} setSelectedDalles - Function to update the selected dalles.
 * @param {any[]} selectedDalles - Array of selected dalles.
 * @returns {Map | null} The initialized map instance.
 */
export const useMap = (
  containerRef: React.RefObject<HTMLDivElement>,
  downloadUrl: any,
  setSelectedDalles: (dalles: any[]) => void,
  selectedDalles: any[]
) => {
  const [map, setMap] = useState<Map | null>(null);
  const [dalleLayer, setDalleLayer] = useState<any>(null);
  const [blocLayer, setBlocLayer] = useState<any>(null);
  const wfsUrl = "https://data.geopf.fr/private/wfs/";

  // Define and register the projection
  proj4.defs(
    "EPSG:2154",
    "+proj=lcc +lat_1=49.000000000 +lat_2=44.000000000 +lat_0=46.500000000 +lon_0=3.000000000 +x_0=700000.000 +y_0=6600000.000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  );
  register(proj4);
  
  useEffect(() => {
    if (!containerRef.current) return;

    /**
     * Create and initialize the map instance.
     */
    const createMap = () => {
      const mapInstance = new Map({
        target: containerRef.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          blocLayer,
          dalleLayer,
        ],
        view: new View({
          center: [288074.8449901076, 6247982.515792289],
          zoom: 6,
          maxZoom: 16,
        }),
        projection: get("EPSG:2154"),
      });

      addControls(mapInstance);
      addZoomInteraction(mapInstance, blocLayer, 10);
      addSelectedInteraction(mapInstance, dalleLayer, setSelectedDalles);
      addHoveredInteraction(mapInstance);
      setMap(mapInstance);
    };

    /**
     * Fetch and apply Geoportal configuration.
     */
    const getConfig = async () => {
      const config = new Gp.Services.Config({
        customConfigFile:
          "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
        onSuccess: createMap,
        onFailure: (e) => console.error(e),
      });
      await config.call();
    };

    const dalleLayer = createWFSLayersDalle(
      wfsUrl,
      downloadUrl + "-dalle",
      8,
      16
    );

    const blocLayer = createWFSLayersBloc(wfsUrl, downloadUrl + "-bloc", 0, 8);

    setDalleLayer(dalleLayer);
    setBlocLayer(blocLayer);

    getConfig();
  }, [containerRef, downloadUrl, setSelectedDalles]);

  // Effect to update the styles of selected dalles when selectedDalles changes
  useEffect(() => {
    console.log("useEffect triggered");
    console.log("dalleLayer:", dalleLayer);
    console.log("selectedDalles:", selectedDalles);
    if (!dalleLayer) return;

    const features = dalleLayer.getSource().getFeatures();
    features.forEach((feature: any) => {
      const isSelected = selectedDalles.some((dalle) => dalle.name === feature.get('name'));
      feature.setStyle(getStyleForDalle(isSelected ? 'selected' : 'default'));
      feature.set('selected', isSelected);
    });
  }, [selectedDalles, dalleLayer]);

  return map;
};
