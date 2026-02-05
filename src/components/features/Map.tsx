import React, {useRef } from "react";
import { useMap } from "../../hooks/maps/useMap";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import SelectedOptions from "./MenuCompenents/SelectedOptions";
const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const mapContainerRef = useRef<HTMLDivElement>(null);

useMap(
    mapContainerRef,
    downloadUrl,
  );


  return (
    <>
      <div
        ref={mapContainerRef}
        id="map"
        className="map-container fr-col-8"
        style={{ height: "80vh", width: "100%" }}
      ></div>

      <SelectedOptions />
    </>
  );
};

export default MapComponent;
