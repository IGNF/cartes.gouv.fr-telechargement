import useMapStore from "../../../hooks/store/useMapStore";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function SelectedOptions() {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);

  return (
    <div className="selected-options-container">
      
      <Button
        className=" gpf-btn-icon"
        iconId="fr-icon-cursor-line"
        priority="tertiary"
        size="medium"
        onClick={() => setSelectionMode("click")}
        disabled={selectionMode === "click"}
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-polygon-icon"
        priority="tertiary"
        title="Sélectionner par surface"
        onClick={() => setSelectionMode("polygon")}

        disabled={selectionMode === "polygon"}
      />
    </div>
  );
}