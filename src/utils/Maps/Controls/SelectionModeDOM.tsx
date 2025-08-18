import React, { useRef, useState, useEffect } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import useMapStore from "../../../hooks/Store/useMapStore"

export const SelectionModeWidget = ({
}: {
}) => {
  const [open, setOpen] = useState(false);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clique à l’extérieur pour fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Bouton flottant */}
      <Button
        className="fr-btn fr-btn--sm "
        title="Changer le mode de sélection"
        iconId="fr-icon-cursor-fill"
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Boîte flottante */}
      {open && (
        <div
          className="fr-p-2w fr-card fr-card--no-shadow gpf-btn-icon-widget"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            border: "1px solid var(--border-default-grey)",
            minWidth: "250px",
          }}
        >
          <div className="fr-select-group fr-mb-2w">
            <label className="fr-label" htmlFor="selection-mode">
              Mode de sélection
            </label>
            <select
              className="fr-select"
              id="selection-mode"
              name="selection-mode"
              defaultValue="click"
              onChange={(e) => {
                const mode = e.target.value;
                setSelectionMode(e.target.value as 'click' | 'polygon' | 'upload');
              }}
            >
              <option value="click">Sélection par clic</option>
              <option value="polygon">Sélection par polygone</option>
              <option value="import">Importer GeoJSON</option>
            </select>
          </div>
          <button
            className="fr-btn fr-btn--secondary fr-btn--sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
