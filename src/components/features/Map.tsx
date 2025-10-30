import React, { useRef, useState } from "react";
import { useMap } from "../../hooks/maps/useMap";
import { useDalleStore } from "../../hooks/store/useDalleStore";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import { GeoJSON } from "ol/format";
import SelectedOptions from "./MenuCompenents/SelectedOptions";
const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const selectedDalle = useDalleStore((state) => state.selectedProduits);
  const addProduit = useDalleStore((state) => state.addProduit);
  const isProduitSelected = useDalleStore((state) => state.isProduitSelected);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const addProduitLayer = useDalleStore((state) => state.addProduitLayer);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useMap(
    mapContainerRef,
    downloadUrl,
    addProduit,
    isProduitSelected,
    removeDalle,
    addProduitLayer
  );

  

  return (
    <>
      <div
        ref={mapContainerRef}
        className="map-container fr-col-8"
        style={{ height: "80vh", width: "100%" }}
      ></div>

      <SelectedOptions />
    </>
  );
};

export default MapComponent;
