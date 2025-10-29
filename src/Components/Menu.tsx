import React, { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useDalleStore } from "../hooks/Store/useDalleStore";
import SelectedTiles from "./MenuCompenents/SlectedTiles";
import EmptyState from "./MenuCompenents/EmptyState";
import SelectedOptions from "./MenuCompenents/SelectedOptions";
import Filter from "./MenuCompenents/FilterComponents/Filter";
import "./menu.css";

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
      <div >
        {/* <Filter></Filter> */}
        <div >
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
