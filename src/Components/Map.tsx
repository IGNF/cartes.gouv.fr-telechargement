import React, { useRef, useState } from "react";
import { useMap } from "../hooks/Maps/useMap";
import { useDalleStore } from "../hooks/Store/useDalleStore";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
const route = getRouteApi("/download/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const selectedDalle = useDalleStore((state)=> state.selectedDalles)
  const addDalle = useDalleStore((state)=> state.addDalle);
  const isDalleSelected = useDalleStore((state) => state.isDalleSelected)
  const removeDalle = useDalleStore((state)=>state.removeDalle)
  const addDalleLayer = useDalleStore((state)=>state.addDalleLayer)


  const mapContainerRef = useRef<HTMLDivElement>(null);

  useMap(mapContainerRef, downloadUrl,selectedDalle, addDalle, isDalleSelected, removeDalle,addDalleLayer);

  return (
    <div
      ref={mapContainerRef}
      className="map-container fr-col-8"
      style={{ height: "90vh", width: "100%" }}
    />
  );
};

export default MapComponent;
