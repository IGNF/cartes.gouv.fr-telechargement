import useMapStore from "../../hooks/Store/useMapStore";

export default function SelectedOptions() {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);

  return (
    <fieldset className="fr-fieldset" aria-labelledby="selection-mode">
      <legend className="fr-fieldset__legend" id="selection-mode">
        Mode de sélection
      </legend>

      <div className="fr-fieldset__element">
        <div className="fr-radio-group">
          <input
            type="radio"
            id="radio-click"
            name="selectionMode"
            value="click"
            checked={selectionMode === "click"}
            onChange={() => setSelectionMode("click")}
          />
          <label className="fr-label" htmlFor="radio-click">
            Sélection par clic
          </label>
        </div>
      </div>

      <div className="fr-fieldset__element">
        <div className="fr-radio-group">
          <input
            type="radio"
            id="radio-polygon"
            name="selectionMode"
            value="polygon"
            checked={selectionMode === "polygon"}
            onChange={() => setSelectionMode("polygon")}
          />
          <label className="fr-label" htmlFor="radio-polygon">
            Sélection par polygone
          </label>
        </div>
      </div>
    </fieldset>
  );
}