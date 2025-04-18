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

  const selectedDalle = useDalleStore((state)=> state.selectedProduits)
  const addDalle = useDalleStore((state)=> state.addProduit);
  const isDalleSelected = useDalleStore((state) => state.isProduitSelected)
  const removeDalle = useDalleStore((state)=>state.removeProduit)
  const addProduitLayer = useDalleStore((state)=>state.addProduitLayer)


  const mapContainerRef = useRef<HTMLDivElement>(null);

  useMap(mapContainerRef, downloadUrl,selectedDalle, addDalle, isDalleSelected, removeDalle,addProduitLayer);

  return (
    <div
      ref={mapContainerRef}
      className="map-container fr-col-8"
      style={{ height: "80vh", width: "100%" }}
    />
  );
};

export default MapComponent;
