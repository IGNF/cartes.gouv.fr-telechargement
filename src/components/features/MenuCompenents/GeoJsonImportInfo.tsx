import React from "react";
import { useDalleStore } from "../../../hooks/store/useDalleStore";
import "./styles/GeoJsonImportInfo.css";

interface GeoJsonImportInfoProps {
  isVisible: boolean;
  onClose: () => void;
}

const GeoJsonImportInfo = ({ isVisible, onClose }: GeoJsonImportInfoProps) => {
  const selectedDalles = useDalleStore((state) => state.selectedProduits);

  if (!isVisible) return null;

  return (
    <div className="geojson-import-info-overlay">
      <div className="geojson-import-info-panel">
        <div className="info-header">
          <h3>Résultat de l'import</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="info-content">
          <div className="info-stat">
            <span className="stat-icon">📍</span>
            <div className="stat-text">
              <span className="stat-label">Dalles sélectionnées</span>
              <span className="stat-value">{selectedDalles.length}</span>
            </div>
          </div>

          {selectedDalles.length > 0 ? (
            <div className="dalles-list">
              <p className="dalles-label">Dalles intersectées :</p>
              <ul>
                {selectedDalles.map((dalle) => (
                  <li key={dalle.id}>
                    <span className="dalle-name">{dalle.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="no-dalles">
              <p>Aucune dalle ne correspond à votre sélection.</p>
            </div>
          )}
        </div>

        <div className="info-footer">
          <button className="btn-close" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeoJsonImportInfo;
