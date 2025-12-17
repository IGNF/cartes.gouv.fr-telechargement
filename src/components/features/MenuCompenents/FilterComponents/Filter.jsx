import React, { use } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import "./Filter.css";
import FilterDate from "./FilterDate";
import { useFilterStore } from "../../../../hooks/store/useFilterStore";

const Filter = ({ onClose } = {}) => {

    const isFiltered = useFilterStore((state) => state.isFiltered);




    return (
        <div className="filter">

            {onClose ? (
                <Button
                    iconId="fr-icon-arrow-left-line"
                    iconPosition="left"
                    priority="tertiary no outline"
                    size="medium"
                    onClick={onClose}>
                    Retour
                </Button>
            ) : null}
                <>
                    <FilterDate />
                </>

        </div>
    );
};

export default Filter;