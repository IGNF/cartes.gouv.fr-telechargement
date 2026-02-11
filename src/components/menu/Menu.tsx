import React, { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDalleStore } from "../../hooks/store/useDalleStore";
import SelectedTiles from "./MenuComponents/SlectedTiles";
import EmptyState from "./MenuComponents/EmptyState";
import "./MenuComponents/styles/Menu.css";
import Button from "@codegouvfr/react-dsfr/Button";
import HelpModal, { helpModal } from "./MenuComponents/HelpModal";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Filter from "./MenuComponents/FilterComponents/Filter"; // ajuster si chemin différent

const route = getRouteApi("/telechargement/$downloadUrl");

const Menu = () => {
  const selectedDalles = useDalleStore((state) => state.selectedProduits);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const clearDalles = useDalleStore((state) => state.removeAllProduits);
  const { downloadUrl } = route.useParams();
  const [showFilter, setShowFilter] = useState(false);

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
    <>
      {showFilter ? (
        <Filter onClose={() => setShowFilter(false)} />
      ) : (
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

          <div className="filter-menu">
            <Input
              label="Jeu de données"
              nativeInputProps={{
                value: downloadUrl?.replace(/-/g, " "),
                readOnly: true,
                "aria-label": "Jeu de données sélectionné",
              }}
            />
            <Button
              priority="secondary"
              size="medium"
              iconId="fr-icon-equalizer-line"
              title="Filtrer"
              onClick={() => setShowFilter(true)}
            >
              Filtrer
            </Button>
          </div>

          <HelpModal />
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
      )}
    </>
  );
};

export default Menu;
