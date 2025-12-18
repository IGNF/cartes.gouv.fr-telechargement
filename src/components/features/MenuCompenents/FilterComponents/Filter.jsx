import { Button } from "@codegouvfr/react-dsfr/Button";
import "./Filter.css";
import FilterDate from "./FilterDate";
import { useFilterStore } from "../../../../hooks/store/useFilterStore";
import { useState } from "react";

const Filter = ({ onClose } = {}) => {

    const isFiltered = useFilterStore((state) => state.isFiltered);
    const resetFilter = useFilterStore((state) => state.resetFilter);
    const [resetKey, setResetKey] = useState(0);
    const handleReset = () => {
        resetFilter();        // logique store si nécessaire
        setResetKey((k) => k + 1); // force le reset du composant enfant
    };


    return (
        <div className="filter">

            <Button
                iconId="fr-icon-arrow-left-line"
                iconPosition="left"
                priority="tertiary no outline"
                size="medium"
                onClick={onClose}
                className="filter-back-button">
                Retour
            </Button>

            <div className="filter-header">
                <h5>Filtrer</h5>
                <Button
                    iconPosition="left"
                    priority="secondary"
                    size="medium"
                    onClick={handleReset}>
                    Réinitialiser
                </Button>
            </div>
            <>
                <FilterDate key={resetKey} />
            </>

        </div>
    );
};

export default Filter;