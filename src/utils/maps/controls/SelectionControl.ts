import { Control } from 'ol/control';
import useMapStore from '../../../hooks/store/useMapStore';
import { geoJsonImportModal } from '../../../components/features/MenuCompenents/GeoJsonImportModal';

/**
 * Contrôle unifié : sélection par clic | par polygone | import GeoJSON
 * Le bouton GeoJSON ouvre la modale DSFR GeoJsonImportModal.
 */
class SelectionControl extends Control {
  private clickButton: HTMLButtonElement;
  private polygonButton: HTMLButtonElement;

  constructor(options: any = {}) {
    const element = document.createElement('div');
    element.className = 'selection-control ol-unselectable ol-control';

    super({ element, target: options.target });

    // ── Bouton clic ──────────────────────────────────────────────────────
    this.clickButton = document.createElement('button');
    this.clickButton.className = 'fr-btn fr-btn--tertiary fr-btn--sm fr-icon-cursor-line';
    this.clickButton.title = 'Sélectionner par clic';
    this.clickButton.setAttribute('type', 'button');

    // ── Bouton polygone ──────────────────────────────────────────────────
    this.polygonButton = document.createElement('button');
    this.polygonButton.className = 'fr-btn fr-btn--tertiary fr-btn--sm fr-icon-polygon-line';
    this.polygonButton.title = 'Sélectionner par surface';
    this.polygonButton.setAttribute('type', 'button');

    // ── Séparateur ───────────────────────────────────────────────────────
    const separator = document.createElement('span');
    separator.className = 'selection-control__separator';

    // ── Bouton import GeoJSON ────────────────────────────────────────────
    const geojsonButton = document.createElement('button');
    geojsonButton.className = 'fr-btn fr-btn--tertiary fr-btn--sm fr-icon-upload-line';
    geojsonButton.title = 'Importer un GeoJSON';
    geojsonButton.setAttribute('type', 'button');

    element.appendChild(this.clickButton);
    element.appendChild(this.polygonButton);
    element.appendChild(separator);
    element.appendChild(geojsonButton);

    // ── Événements ───────────────────────────────────────────────────────
    this.clickButton.addEventListener('click', () => {
      useMapStore.getState().setSelectionMode('click');
      this.updateButtonStates('click');
    });

    this.polygonButton.addEventListener('click', () => {
      useMapStore.getState().setSelectionMode('polygon');
      this.updateButtonStates('polygon');
    });

    // Ouvre la modale DSFR — c'est elle qui gère le fichier et l'import
    geojsonButton.addEventListener('click', () => geoJsonImportModal.open());

    // État initial
    this.updateButtonStates(useMapStore.getState().selectionMode);
  }

  private updateButtonStates(mode: 'click' | 'polygon') {
    this.clickButton.classList.toggle('active', mode === 'click');
    this.polygonButton.classList.toggle('active', mode === 'polygon');
  }
}

export default SelectionControl;
