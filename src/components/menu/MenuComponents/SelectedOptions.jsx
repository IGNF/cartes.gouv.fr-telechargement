import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import useMapStore from "../../../hooks/store/useMapStore";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function SelectedOptions() {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);
  const [mapContainer, setMapContainer] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const selector = "#map, .gpf-map, .ol-map";
    const find = () => document.querySelector(selector);
    let el = find();
    if (el) {
      setMapContainer(el);
      return;
    }
    const mo = new MutationObserver(() => {
      el = find();
      if (el) {
        setMapContainer(el);
        mo.disconnect();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target.result);
        if (geojson.type === "FeatureCollection" || geojson.type === "Feature") {
          // Ajouter la logique pour traiter le GeoJSON
          // Exemple : ajouter à la carte, au store, etc.
        } else {
          console.error("Format GeoJSON invalide");
        }
      } catch (err) {
        console.error("Erreur lors de la lecture du fichier :", err);
      }
    };
    reader.readAsText(file);

    // Réinitialise l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const box = (
    <div className="selected-options-container" aria-label="Options de sélection">
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-cursor-line"
        priority="tertiary"
        size="medium"
        onClick={() => setSelectionMode("click")}
        disabled={selectionMode === "click"}
        title="Sélectionner par clic"
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-polygon-icon"
        priority="tertiary"
        title="Sélectionner par surface"
        onClick={() => setSelectionMode("polygon")}
        disabled={selectionMode === "polygon"}
      />
      {/* <input
        ref={fileInputRef}
        type="file"
        iconId="fr-icon-file-upload-line"
        accept=".geojson,.json"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        aria-label="Importer un fichier GeoJSON"
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-upload-line"
        priority="tertiary"
        title="Importer une emprise (GeoJSON)"
        onClick={() => fileInputRef.current?.click()}
      /> */}
    </div>
  );

  if (mapContainer) return createPortal(box, mapContainer);
  return null;
}