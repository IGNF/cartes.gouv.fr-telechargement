import React, { useEffect, useRef } from "react";
import { useMap } from "../../hooks/maps/useMap";
import { useDalleStore } from "../../hooks/store/useDalleStore";
import { Map } from "ol";
import SelectionControl from "../../utils/maps/controls/SelectionControl";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import { GeoJSON } from "ol/format";
import SelectedOptions from "./MenuCompenents/SelectedOptions";
import { set } from "ol/transform";
const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const selectedDalle = useDalleStore((state) => state.selectedProduits);
  const addProduit = useDalleStore((state) => state.addProduit);
  const isProduitSelected = useDalleStore((state) => state.isProduitSelected);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const addProduitLayer = useDalleStore((state) => state.addProduitLayer);
  const setIsMetadata = useDalleStore((state) => state.setIsMetadata);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapInstance = useMap(
    mapContainerRef,
    downloadUrl,
    addProduit,
    isProduitSelected,
    removeDalle,
    addProduitLayer,
    setIsMetadata
  );

  useEffect(() => {
    if (mapInstance) {
      const selectionControl = new SelectionControl();
      mapInstance.addControl(selectionControl);

      return () => {
        mapInstance.removeControl(selectionControl);
      };
    }
  }, [mapInstance]);

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
