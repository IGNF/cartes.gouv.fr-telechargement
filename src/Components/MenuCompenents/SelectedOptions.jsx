import useMapStore from "../../hooks/Store/useMapStore";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";

export default function SelectedOptions() {
  const selectionMode = useMapStore((state) => state.selectionMode);
  const setSelectionMode = useMapStore((state) => state.setSelectionMode);

  return (
    <div className="selected-options-container">
      
      <Button
        className=" gpf-btn-icon"
        iconId="fr-icon-cursor-line"
        priority="tertiary"
        onClick={() => setSelectionMode("click")}
      />
      <Button
        className="gpf-btn-icon"
        iconId="fr-icon-polygon-icon"
        priority="tertiary"
        title="Sélectionner par surface"
        onClick={() => setSelectionMode("polygon")}
      />
    </div>
  );
}