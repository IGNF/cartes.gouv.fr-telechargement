import { useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get } from "ol/proj";

import Gp from "geoportal-access-lib";
import { LayerWMTS } from "geopf-extensions-openlayers";

import { addControls } from "../../utils/maps/controls";
import { tmsLayer } from "../../utils/maps/Layers";
import { addZoomInteraction } from "../../utils/maps/interactions";
import { getStyleForDalle } from "../../utils/maps/style";
import VectorTileLayer from "ol/layer/VectorTile";
import useMapStore from "../store/useDalleStore";

import { SelectedPolygonInteraction } from "../../utils/interactions/selectedPolygonInteraction";
import { SelectedClickInteraction } from "../../utils/interactions/selectedClickInteraction";
import { HoverPopupInteraction } from "../../utils/interactions";

export const useMap = (
  containerRef: React.RefObject<HTMLDivElement>,
  downloadUrl: string,
  addProduit: any,
  isProduitSelected: any,
  removeProduit: any,
  addProduitLayer: any
) => {
  const [map, setMap] = useState<Map | null>(null);

  // ton store a déjà un "selectionMode"
  const selectionMode = useMapStore((state) => state.selectionMode);

  // projection
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
    style: (feature) => {
      if (isProduitSelected(feature.getProperties().id)) {
        return getStyleForDalle("selected");
      }
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;

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

      // ajout interactions
      const polygonInteraction = new SelectedPolygonInteraction(
        selectionProduitLayer,
        isProduitSelected,
        addProduit,
        removeProduit
      ).getDrawInteraction();
      mapInstance.addInteraction(polygonInteraction);
      polygonInteraction.setActive(false);

      const clickInteraction = new SelectedClickInteraction(
        selectionProduitLayer,
        10,
        isProduitSelected,
        addProduit,
        removeProduit
      );
      mapInstance.addInteraction(clickInteraction);
      clickInteraction.setActive(true);

      const hoverInteractionChantier = new HoverPopupInteraction({
        layer: chantierLayer,
      });
      mapInstance.addInteraction(hoverInteractionChantier);


      const hoverInteractionProduit = new HoverPopupInteraction({
        layer: produitLayer,
      });
      mapInstance.addInteraction(hoverInteractionProduit);

      // ⚡ bascule entre les interactions selon selectionMode
      useMapStore.subscribe((state) => {
        if (state.selectionMode === "polygon") {
          polygonInteraction.setActive(true);
          clickInteraction.setActive(false);
        } else if (state.selectionMode === "click") {
          polygonInteraction.setActive(false);
          clickInteraction.setActive(true);
        } else {
          polygonInteraction.setActive(false);
          clickInteraction.setActive(false);
        }
      });

      setMap(mapInstance);
    };

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
