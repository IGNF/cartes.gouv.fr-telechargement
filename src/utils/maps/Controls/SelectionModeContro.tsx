import Control from 'ol/control/Control';
import { createRoot } from 'react-dom/client';
import { SelectionModeWidget } from './SelectionModeDOM';

export class SelectionModeControl extends Control {
  constructor(onChange: (mode: string) => void) {
    const container = document.createElement('div');
    container.className = 'ol-unselectable ol-control dsfr-control';
    super({ element: container });

    const root = createRoot(container);
    root.render(<SelectionModeWidget />);
  }
}
