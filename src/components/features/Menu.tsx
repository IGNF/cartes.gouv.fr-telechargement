import React from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDalleStore } from "../../hooks/store/useDalleStore";
import SelectedTiles from "./MenuCompenents/SlectedTiles";
import EmptyState from "./MenuCompenents/EmptyState";
import "./MenuCompenents/styles/Menu.css";
import Button from "@codegouvfr/react-dsfr/Button";
import HelpModal, { helpModal } from "./MenuCompenents/HelpModal";

const route = getRouteApi("/telechargement/$downloadUrl");

const Menu = () => {
  const selectedDalles = useDalleStore((state) => state.selectedProduits);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const clearDalles = useDalleStore((state) => state.removeAllProduits);

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
    <div className="menu">
      <div className="title-menu">
        <h4 className="fr-h4">Téléchargement de données</h4>
        <Button
          priority="tertiary no outline"
          size="small"
          iconId="fr-icon-information-line"
          title="Informations sur le téléchargement de données"
          onClick={() => helpModal.open()}
        />
      </div>

      <HelpModal />

      <SelectedTiles
        selectedDalles={selectedDalles}
        onDownload={onDownload}
        removeDalle={removeDalle}
        clearDalles={clearDalles}
      />
    </div>
  );
};

export default Menu;
