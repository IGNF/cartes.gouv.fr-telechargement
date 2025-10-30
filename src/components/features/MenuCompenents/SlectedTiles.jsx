
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";


const SelectedTiles = ({ selectedDalles, onDownload, removeDalle, clearDalles }) => {
  return (
    <>
      <h3 >Dalles sélectionnées</h3>

      <ul
        style={{
          maxHeight: "288px",
          overflowY: "auto",
        }}
      >
        {selectedDalles.map((dalle, index) => (

          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "columns",
            }}
          >

            <Checkbox
              options={[
                {
                  nativeInputProps: {
                    name: `checkboxes-${dalle.id}`,
                    value: dalle.id
                  }
                }
              ]}
            />

              <Download
                details=""
                label={`${dalle.name}`}
                linkProps={{
                  href: dalle.url,
                  title: `Télécharger la dalle ${dalle.name}`,
                  "aria-label": `Télécharger la dalle ${dalle.name}`,
                }}
              />
            <Button
              iconId="fr-icon-delete-line"
              onClick={() => removeDalle(dalle.name)}
              priority="tertiary no outline"
              size="small"
              title={`Supprimer la dalle ${dalle.name}`}
              aria-label={`Supprimer la dalle ${dalle.name}`}
            />
          </li>
        ))}
      </ul>

      <div >
        <Button
          size="medium"
          iconId="fr-icon-download-line"
          onClick={onDownload}
          className="fr-mr-2w"
          title="Télécharger la liste des liens des dalles sélectionnées"
          aria-label="Télécharger la liste des liens des dalles sélectionnées"
        >
          Télécharger la liste
        </Button>
        <Button
          size="medium"
          iconId="fr-icon-delete-line"
          onClick={clearDalles}
          priority="secondary"
          title="Effacer toutes les dalles sélectionnées"
          aria-label="Effacer toutes les dalles sélectionnées"
        >
          Tout supprimer
        </Button>
      </div>
    </>
  );
};

export default SelectedTiles;