import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import "./Filter.css";
import FilterDate from "./FilterDate";

const Filter = ({ onClose } = {}) => {
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

            <div className="filter-body" style={{ marginTop: 12 }}>
                <strong>Aucun filtre disponible</strong>
                <div style={{ marginTop: 6 }}>
                    Pour cette donnée, aucun critère de filtrage n'est proposé pour l'instant.
                </div>


            </div>
        </div>
    );
};

export default Filter;