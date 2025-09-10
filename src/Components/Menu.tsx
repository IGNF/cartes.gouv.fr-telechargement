import React, { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useDalleStore } from "../hooks/Store/useDalleStore";
import SelectedTiles from "./MenuCompenents/SlectedTiles";
import EmptyState from "./MenuCompenents/EmptyState";
import SelectedOptions from "./MenuCompenents/SelectedOptions";

const route = getRouteApi("/telechargement/$downloadUrl");

const Menu = () => {
  const { downloadUrl } = route.useParams();
  const selectedDalles = useDalleStore((state) => state.selectedProduits);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const clearDalles = useDalleStore((state) => state.removeAllProduits);

  const [selectionMode, setSelectionMode] = useState("click");

  const onDownload = () => {
    const contenu = selectedDalles.map((dalle) => dalle.url).join("\n");
    const blob = new Blob([contenu], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `dalles.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  return (
    <div className="fr-container fr-mt-3w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-10 fr-col-lg-12">
          <SelectedOptions/>
          {selectedDalles.length > 0 ? (
            <SelectedTiles
              selectedDalles={selectedDalles}
              onDownload={onDownload}
              removeDalle={removeDalle}
              clearDalles={clearDalles}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
