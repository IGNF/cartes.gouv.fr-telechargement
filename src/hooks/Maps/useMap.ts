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
import { tmsLayer } from "../../utils/Maps/Layers";
import {
  addSelectedProduitInteraction,
  addZoomInteraction,
} from "../../utils/Maps/interactions";
import { getStyleForDalle } from "../../utils/Maps/style";
import VectorTileLayer from "ol/layer/VectorTile";
import useMapStore from "../Store/useMapStore";

import { addPolygonSelectionInteraction } from "../../utils/Maps/interactions";
import { addUploadSelectionInteraction } from "../../utils/Maps/interactions";
import {
  HoveredInteraction,
  SelectedClickInteraction,
} from "../../utils/interactions";
import { SelectedPolygonInteraction } from "../../utils/interactions/selectedPolygonInteraction";

/**
 * Custom hook to initialize and manage an OpenLayers map.
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef - The reference to the map container element.
 * @param {string} downloadUrl - The URL for downloading map data.
 * @param {Function} setSelectedDalles - Function to update the selected dalles.
 * @param {any[]} selectedProduits - Array of selected dalles.
 * @returns {Map | null} The initialized map instance.
 */
export const useMap = (
  containerRef: React.RefObject<HTMLDivElement>,
  downloadUrl: string,
  selectedProduits: any,
  addProduit: any,
  isProduitSelected: any,
  removeProduit: any,
  addProduitLayer: any
) => {
  const [map, setMap] = useState<Map | null>(null);
  const [selectedPolygonInteraction, setSelectecPolygonInteraction] = useState<SelectedPolygonInteraction | null>(null);
  const selectionMode = useMapStore((state) => state.selectionMode);

  // Define and register the projection
  proj4.defs(
    "EPSG:3857",
    "+proj=lcc +lat_1=49.000000000 +lat_2=44.000000000 +lat_0=46.500000000 +lon_0=3.000000000 +x_0=700000.000 +y_0=6600000.000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  );
  register(proj4);

  const chantierLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${downloadUrl}-chantier/{z}/{x}/{y}.pbf`,
    10
  );

  const produitLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${downloadUrl}-produit/{z}/{x}/{y}.pbf`,
    16
  );

  const selectionProduitLayer = new VectorTileLayer({
    renderMode: "vector",
    source: produitLayer.getSource(),
    style: function (feature) {
      if (isProduitSelected(feature.getProperties().name)) {
        return getStyleForDalle("selected");
      }
    },
  });

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
          chantierLayer,
          produitLayer,
          selectionProduitLayer,
        ],
        view: new View({
          center: [288074.8449901076, 6247982.515792289],
          zoom: 6,
          maxZoom: 16,
        }),
        projection: get("EPSG:2154"),
      });

      addProduitLayer(selectionProduitLayer);
      addControls(mapInstance);
      addZoomInteraction(mapInstance, chantierLayer, 11);
      // addSelectedProduitInteraction(
      //   mapInstance,
      //   selectionProduitLayer,
      //   isProduitSelected,
      //   addProduit,
      //   removeProduit,
      //   downloadUrl
      // );
      const selectedPolygonInteraction = new SelectedPolygonInteraction(
        mapInstance,
        selectionProduitLayer,
        isProduitSelected,
        addProduit,
        removeProduit
      );

      const selectedClickInteraction = new SelectedClickInteraction(
        mapInstance,
        selectionProduitLayer,
        10,
        isProduitSelected,
        addProduit,
        removeProduit
      );

      selectedPolygonInteraction.setActive(false);

      // mapInstance.addInteraction(new HoveredInteraction(
      //   mapInstance,
      //   selectionProduitLayer,
      //   isProduitSelected
      // ));
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
  }, []);

  return map;
};
