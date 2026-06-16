import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import useDalleStore from "../../../hooks/store/useDalleStore";

export default function HistoryNavigation() {
  const historicPastSteps = useDalleStore((state) => state.historicPastSteps);
  const historicFutureSteps = useDalleStore((state) => state.historicFutureSteps);
  const navigateHistory = useDalleStore((state) => state.navigateHistory);
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
    <div
      className="history-navigation-container"
      aria-label="Navigation dans l'historique"
    >
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-arrow-go-back-line"
        priority="tertiary"
        size="medium"
        onClick={() => navigateHistory("undo")}
        disabled={historicPastSteps.length === 0}
        title="Annuler"
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-arrow-go-forward-line"
        priority="tertiary"
        size="medium"
        onClick={() => navigateHistory("redo")}
        disabled={historicFutureSteps.length === 0}
        title="Rétablir"
      />
    </div>
  );

  if (mapContainer) return createPortal(box, mapContainer);
  return null;
}
