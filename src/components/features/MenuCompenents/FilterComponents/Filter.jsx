import React, { use } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import "./Filter.css";
import FilterDate from "./FilterDate";
import { useFilterStore } from "../../../../hooks/store/useFilterStore";

const Filter = ({ onClose } = {}) => {

    const isFiltered = useFilterStore((state) => state.isFiltered);
    const resetFilter = useFilterStore((state) => state.resetFilter);




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
                    onClick={resetFilter}>
                    Réinitialiser
                </Button>
                </div>
                <>
                    <FilterDate />
                </>

        </div>
    );
};

export default Filter;