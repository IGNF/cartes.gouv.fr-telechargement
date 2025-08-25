import React, { useRef, useState } from "react";
import { useMap } from "../hooks/Maps/useMap";
import { useDalleStore } from "../hooks/Store/useDalleStore";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import SelectionModeWidget from "./Map/SelectorWidget";
import { GeoJSON } from "ol/format";
const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();

  const selectedDalle = useDalleStore((state) => state.selectedProduits);
  const addProduit = useDalleStore((state) => state.addProduit);
  const isDalleSelected = useDalleStore((state) => state.isProduitSelected);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const addProduitLayer = useDalleStore((state) => state.addProduitLayer);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useMap(
    mapContainerRef,
    downloadUrl,
    selectedDalle,
    addProduit,
    isDalleSelected,
    removeDalle,
    addProduitLayer
  );

  const [mode, setMode] = useState<"click" | "polygon" | "geojson">("click");
  const handleGeoJSONImport = (geojson: object) => {
    const features = new GeoJSON().readFeatures(geojson, {
      featureProjection: "EPSG:2154",
    });

    // Ajouter les features au layer de sélection (ou en callback vers le hook)
    // Optionnel : filtrer les dalles existantes avec geometry.intersectsGeometry
    console.log("Features importées via GeoJSON :", features);
  };

  return (
    <div
      ref={mapContainerRef}
      className="map-container fr-col-8"
      style={{ height: "80vh", width: "100%" }}
    >
    </div>
  );
};

export default MapComponent;
