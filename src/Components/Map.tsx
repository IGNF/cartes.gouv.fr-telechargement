import React, { useRef, useState } from "react";
import { useMap } from "../hooks/Maps/useMap";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import Menu from "./Menu";
const route = getRouteApi("/download/$downloadUrl");

function MapComponent() {
  const { downloadUrl } = route.useParams();

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // État pour les dalles sélectionnées
  const [selectedDalles, setSelectedDalles] = useState<any[]>([]);

  useMap(mapContainerRef, downloadUrl, setSelectedDalles, selectedDalles);

  return (
    <div className="fr-container--fluid fr-grid-row">
      <div
        ref={mapContainerRef}
        className="map-container fr-col-10"
        style={{ height: "70vh", width: "100%" }}
      />
      <div className="fr-col-2" >
      <Menu selectedDalles={selectedDalles} title={downloadUrl}></Menu>
      </div>
    </div>
  );
}

export default MapComponent;
