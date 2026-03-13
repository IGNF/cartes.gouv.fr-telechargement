import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useMapStore from "../../../hooks/store/useMapStore";
import useDalleStore from "../../../hooks/store/useDalleStore";
import {
  selectDallesFromGeoJson,
  addGeoJsonLayerToMap,
  waitForRenderAndSelect,
} from "../../../utils/interactions/geojsonInteraction";
import GeoJsonImportInfo from "./GeoJsonImportInfo";
import "./styles/GeoJsonImportModal.css";

interface GeoJsonFeature {
  type: "Feature" | "FeatureCollection";
  geometry: any;
  properties?: any;
}

// API externe pour SelectionControl (OL natif)
let _setOpen: ((v: boolean) => void) | null = null;
export const geoJsonImportModal = {
  open: () => _setOpen?.(true),
  close: () => _setOpen?.(false),
};

const GeoJsonImportModal = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingGeoJson, setPendingGeoJson] = useState<GeoJsonFeature | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [mapEl, setMapEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    _setOpen = setIsOpen;
    // Récupérer le conteneur de la carte pour le portail
    setMapEl(document.getElementById("map"));
    return () => { _setOpen = null; };
  }, []);

  const reset = () => {
    setFileName(null);
    setPendingGeoJson(null);
    setError(null);
    setIsDragOver(false);
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  const isValidGeoJson = (g: any) =>
    g && typeof g === "object" &&
    ((g.type === "FeatureCollection" && Array.isArray(g.features)) ||
      (g.type === "Feature" && g.geometry));

  const readFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target?.result as string) as GeoJsonFeature;
        if (!isValidGeoJson(geojson)) throw new Error("Format GeoJSON invalide.");
        setFileName(file.name);
        setPendingGeoJson(geojson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de lecture");
        reset();
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => { setError("Erreur de lecture"); setIsLoading(false); };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!pendingGeoJson) return;
    try {
      const mapInstance = useMapStore.getState().mapInstance;
      const { isProduitSelected, addProduit, produitLayer } = useDalleStore.getState();
      if (!mapInstance) throw new Error("La carte n'est pas initialisée");
      if (!produitLayer) throw new Error("La couche des dalles n'est pas initialisée");
      addGeoJsonLayerToMap(pendingGeoJson, mapInstance);
      waitForRenderAndSelect(mapInstance, () => {
        selectDallesFromGeoJson(
          pendingGeoJson,
          produitLayer,
          (id) => isProduitSelected(id as string),
          addProduit
        );
      });
      setShowInfoPanel(true);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
    }
  };

  const panel = isOpen ? (
    <>
      {/* Overlay invisible pour fermer au clic extérieur */}
      <div className="gji-overlay" onClick={handleClose} />

      {/* Panneau ancré au même top/right que le widget, décalé à gauche */}
      <div className="gji-panel">
        <div className="gji-panel-header">
          <span className="fr-icon-file-line gji-header-icon" aria-hidden="true" />
          <span className="gji-panel-title">Contenu en symbole</span>
          <button
            type="button"
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line gji-close-btn"
            title="Fermer"
            onClick={handleClose}
          />
        </div>

        <div className="gji-container">
          <p className="gji-label">Formats acceptés</p>
          <div className="gji-badges">
            <span className="gji-badge">GEOJSON</span>
          </div>

          <div
            className={`gji-dropzone${isDragOver ? " gji-dropzone--over" : ""}${fileName ? " gji-dropzone--has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && (file.name.endsWith(".geojson") || file.name.endsWith(".json"))) {
                readFile(file);
              } else {
                setError("Fichier .geojson ou .json requis");
              }
            }}
            onClick={() => !fileName && fileInputRef.current?.click()}
          >
            {fileName ? (
              <div className="gji-file-selected">
                <span className="fr-icon-file-line gji-file-icon" aria-hidden="true" />
                <span className="gji-file-name">{fileName}</span>
                <button
                  type="button"
                  className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line"
                  title="Retirer"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                />
              </div>
            ) : (
              <>
                <span className="fr-icon-upload-line gji-upload-icon" aria-hidden="true" />
                <p className="gji-drop-text">Glissez-déposez votre fichier ici</p>
                <p className="gji-or">ou</p>
                <button
                  type="button"
                  className="fr-btn fr-btn--secondary fr-btn--sm"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Parcourir
                </button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }}
            style={{ display: "none" }}
            disabled={isLoading}
          />

          <p className="gji-hint">
            Taille maximale du fichier : 10 Mo. Le fichier importé sera utilisé pour
            sélectionner automatiquement les dalles correspondantes.
          </p>

          {error && (
            <div className="fr-alert fr-alert--error fr-alert--sm">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="gji-loading">
              <div className="gji-spinner" />
              <span>Lecture…</span>
            </div>
          )}
        </div>

        <div className="gji-panel-footer">
          <button
            type="button"
            className="fr-btn fr-btn--primary fr-btn--sm"
            disabled={!pendingGeoJson || isLoading}
            onClick={handleImport}
          >
            Importer
          </button>
          <button
            type="button"
            className="fr-btn fr-btn--secondary fr-btn--sm"
            onClick={handleClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Portail dans #map pour que position:absolute soit relatif à la carte */}
      {mapEl && panel ? createPortal(panel, mapEl) : null}
      <GeoJsonImportInfo isVisible={showInfoPanel} onClose={() => setShowInfoPanel(false)} />
    </>
  );
};

export default GeoJsonImportModal;
