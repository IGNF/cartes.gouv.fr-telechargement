import { Button } from "@codegouvfr/react-dsfr/Button";
import "./Filter.css"
import FilterDate from "./FilterDate";

const Filter = () => {
    return (
        <div className="filter">
        <div className="filter-header">
            <div className="filter-label">Filtrer</div>
            <Button
                onClick={function noRefCheck() { }}
                priority="tertiary"
            >
                Réinitialiser
            </Button>
        </div>
        <FilterDate />
        </div>
    )

}

export default Filter;