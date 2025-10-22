import { Button } from "@codegouvfr/react-dsfr/Button";
import "./Filter.css"
const Filter = () => {
    return (
        <>
        <div className="filter">
            <div className="filter-label">Filtrer</div>
            <Button
                onClick={function noRefCheck() { }}
                priority="tertiary"
            >
                Réinitialiser
            </Button>
        </div>
        </>
    )

}

export default Filter;