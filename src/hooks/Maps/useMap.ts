// React Core
import { useEffect, useState } from "react";

// OpenLayers Core
import Map from "ol/Map";
import View from "ol/View";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get } from "ol/proj";

// Geoportal Extensions
import Gp from "geoportal-access-lib";
import { LayerWMTS } from "geopf-extensions-openlayers";

// Custom Utils
import { addControls } from "../../utils/Maps/controls";
import {
  createWFSLayersBloc,
  createWFSLayersDalle,
} from "../../utils/Maps/Layers";
import {
  addSelectedInteraction,
  addZoomInteraction,
  useForceUpdateLayer,
} from "../../utils/Maps/interactions";
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
  downloadUrl: string,
  selectedDalles: any,
  addDalle: any,
  isDalleSelected: any,
  removeDalle: any,
  addDalleLayer: any
) => {
  const [map, setMap] = useState<Map | null>(null);
  const wfsUrl = "https://data.geopf.fr/private/wfs/";

  const handleFeatureClick = (
    dalleName: string,
    dalleUrl: string,
    dalleId: string
  ) => {
    const dalle = { name: dalleName, url: dalleUrl, id: dalleId };

    if (!isDalleSelected(dalle.name)) {
      addDalle(dalle);
    } else {
      console.log("remove");
      removeDalle(dalle.id);
    }
    dalleLayer.getSource()?.refresh()
  };

  // Define and register the projection
  proj4.defs(
    "EPSG:2154",
    "+proj=lcc +lat_1=49.000000000 +lat_2=44.000000000 +lat_0=46.500000000 +lon_0=3.000000000 +x_0=700000.000 +y_0=6600000.000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  );
  register(proj4);

  const dalleLayer = createWFSLayersDalle(
    wfsUrl,
    downloadUrl + "-dalle",
    selectedDalles,
    isDalleSelected,
    8,
    16
  );

  const blocLayer = createWFSLayersBloc(wfsUrl, downloadUrl + "-bloc", 0, 8);

  useEffect(() => {
    if (!containerRef.current) return;

    /**
     * Create and initialize the map instance.
     */
    const createMap = () => {
      const mapInstance = new Map({
        target: containerRef.current,
        layers: [
          new LayerWMTS({
            layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
          }),
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
      addZoomInteraction(mapInstance, blocLayer, 12);
      addSelectedInteraction(mapInstance, dalleLayer, handleFeatureClick);
      // addHoveredInteraction(mapInstance, dalleLayer);
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

    getConfig();
  }, [containerRef, downloadUrl]);

  useEffect(() => {
    console.log("Mise à jour du style des features...");

    // dalleLayer.getSource()?.refresh();

    dalleLayer.getSource()?.on("change", function (evt) {
      var source = evt.target;
      console.log(evt.target);

      if (source.getState() === "ready") {
        addDalleLayer(source);
      }
    });

    console.log(selectedDalles);
    map?.getLayers();
  }, [dalleLayer]);

  return map;
};
