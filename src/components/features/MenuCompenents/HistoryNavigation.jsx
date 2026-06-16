import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import useDalleStore from "../../../hooks/store/useDalleStore";

export default function HistoryNavigation() {
  const historicPastItems = useDalleStore((state) => state.historicPastItems);
  const historicFutureItems = useDalleStore((state) => state.historicFutureItems);
  const stepHistory = useDalleStore((state) => state.stepHistory);
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
        iconId="fr-icon-arrow-left-s-line"
        priority="tertiary"
        size="medium"
        onClick={() => stepHistory("undo")}
        disabled={historicPastItems.length === 0}
        title="Annuler"
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-arrow-right-s-line"
        priority="tertiary"
        size="medium"
        onClick={() => stepHistory("redo")}
        disabled={historicFutureItems.length === 0}
        title="Rétablir"
      />
    </div>
  );

  if (mapContainer) return createPortal(box, mapContainer);
  return null;
}
