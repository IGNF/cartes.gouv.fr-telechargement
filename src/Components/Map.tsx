import React, { useRef } from "react";
import { useMap } from "../hooks/Maps/useMap";

import 'ol/ol.css';
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
const route = getRouteApi('/download/$downloadUrl')

function MapComponent() {
  const {downloadUrl} = route.useParams()
  console.log(downloadUrl);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useMap(mapContainerRef, downloadUrl );


  return (
      <div
        ref={mapContainerRef}
        id="map-container"
        className="map-container fr-col-10"
        style={{ height: "70vh", width: "100%" }}
      />
  );
}

export default MapComponent;
