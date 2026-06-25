import React, { useRef } from "react";
import { useMap } from "../../hooks/maps/useMap";
import { useDalleStore } from "../../hooks/store/useDalleStore";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import "../../utils/controls/GeoJsonImportControl.css";
import "../../utils/maps/controls/SelectionControl.css";
import { getRouteApi } from "@tanstack/react-router";
import SelectedOptions from "./MenuCompenents/SelectedOptions.jsx";
import GeoJsonImportModal from "./MenuCompenents/GeoJsonImportModal";
import HistoryNavigation from "./MenuCompenents/HistoryNavigation.jsx";

const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const addProduit = useDalleStore((state) => state.addProduit);
  const isProduitSelected = useDalleStore((state) => state.isProduitSelected);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const addProduitLayer = useDalleStore((state) => state.addProduitLayer);
  const addChantierLayer = useDalleStore((state) => state.addChantierLayer);
  const setIsMetadata = useDalleStore((state) => state.setIsMetadata);
  const addHistoricStep = useDalleStore((state) => state.addHistoricStep);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useMap(
    mapContainerRef as React.RefObject<HTMLDivElement>,
    downloadUrl,
    addProduit,
    isProduitSelected,
    removeDalle,
    addProduitLayer,
    addChantierLayer,
    setIsMetadata,
    addHistoricStep
  );

  return (
    <>
      <div
        ref={mapContainerRef}
        id="map"
        className="map-container fr-col-8"
        style={{ height: "80vh", width: "100%" }}
      ></div>

      <GeoJsonImportModal />
      <HistoryNavigation />
    </>
  );
};

export default MapComponent;
