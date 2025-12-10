import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useMapStore from "../../../hooks/store/useMapStore";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function SelectedOptions() {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);

  const [mapContainer, setMapContainer] = useState(null);

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

  const box = (
    <div className="selected-options-container" aria-label="Options de sélection">
      <Button
        className=" gpf-btn-icon"
        iconId="fr-icon-cursor-line"
        priority="tertiary"
        size="medium"
        onClick={() => setSelectionMode("click")}
        disabled={selectionMode === "click"}
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-polygon-icon"
        priority="tertiary"
        title="Sélectionner par surface"
        onClick={() => setSelectionMode("polygon")}
        disabled={selectionMode === "polygon"}
      />
    </div>
  );

  if (mapContainer) return createPortal(box, mapContainer);
  // fallback: ne rien afficher tant que la carte n'est pas montée
  return null;
}