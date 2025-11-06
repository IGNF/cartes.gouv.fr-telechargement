import { Control } from 'ol/control';
import useMapStore from '../../../hooks/store/useMapStore';

class SelectionControl extends Control {
  constructor(options: any = {}) {
    const element = document.createElement('div');
    element.className = 'selection-control ol-unselectable ol-control';

    super({
      element,
      target: options.target,
    });

    // Création des boutons
    const clickButton = document.createElement('button');
    clickButton.className = 'fr-btn fr-btn--tertiary fr-btn--sm fr-icon-cursor-line';
    clickButton.title = 'Sélectionner par clic';
    clickButton.setAttribute('type', 'button');
    element.appendChild(clickButton);

    const polygonButton = document.createElement('button');
    polygonButton.className = 'fr-btn fr-btn--tertiary fr-btn--sm fr-icon-polygon-line';
    polygonButton.title = 'Sélectionner par surface';
    polygonButton.setAttribute('type', 'button');
    element.appendChild(polygonButton);

    // Gestion des événements
    clickButton.addEventListener('click', () => {
      useMapStore.getState().setSelectionMode('click');
      this.updateButtonStates('click');
    });

    polygonButton.addEventListener('click', () => {
      useMapStore.getState().setSelectionMode('polygon');
      this.updateButtonStates('polygon');
    });

    // État initial
    this.updateButtonStates(useMapStore.getState().selectionMode);
  }

  private updateButtonStates(mode: 'click' | 'polygon') {
    const buttons = this.element.getElementsByTagName('button');
    Array.from(buttons).forEach(button => {
      button.classList.remove('active');
      if (
        (mode === 'click' && button.classList.contains('fr-icon-cursor-line')) ||
        (mode === 'polygon' && button.classList.contains('fr-icon-polygon-line'))
      ) {
        button.classList.add('active');
      }
    });
  }
}

export default SelectionControl;