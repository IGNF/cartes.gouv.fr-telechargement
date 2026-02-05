import { useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get } from "ol/proj";

import Gp from "geoportal-access-lib";
import { LayerWMTS } from "geopf-extensions-openlayers";

import { addControls } from "../../utils/maps/controls";
import { useLayers } from "./useLayers";

export const useMap = (
  containerRef: React.RefObject<HTMLDivElement> | null,
  downloadUrl: string,
) => {

  // projection
  proj4.defs(
    "EPSG:3857",
    "+proj=lcc +lat_1=49.000000000 +lat_2=44.000000000 +lat_0=46.500000000 +lon_0=3.000000000 +x_0=700000.000 +y_0=6600000.000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  );
  register(proj4);


  useEffect(() => {
    if (!containerRef.current) return;

    const createMap = () => {
      const mapInstance = new Map({
        target: containerRef.current,
        layers: [
          new LayerWMTS({
            layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
          })
        ],
        view: new View({
          center: [288074.8449901076, 6247982.515792289],
          zoom: 6,
          maxZoom: 16,
        }),
        projection: get("EPSG:2154"),
      });

      useLayers(mapInstance,downloadUrl)

      addControls(mapInstance);
     

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

};
