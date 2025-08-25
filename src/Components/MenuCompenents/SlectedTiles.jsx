import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Download } from "@codegouvfr/react-dsfr/Download";
import ModalComponent from "./Modal/Modal";



const SelectedTiles = ({ selectedDalles, onDownload, removeDalle, clearDalles }) => {
  return (
    <>
      <h3 className="fr-h3">Dalles sélectionnées</h3>
      <Accordion
        className="fr-mb-2w"
        label={`Dalles sélectionnées (${selectedDalles.length})`}
        defaultExpanded={true}
      >
        <ul
          className="fr-mb-2w"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {selectedDalles.map((dalle, index) => (
            <li
              key={index}
              className="fr-grid-row fr-grid-row--gutters fr-p-1w fr-border-bottom"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{dalle.name}</strong>
                <Download
                  details=""
                  label="Lien de téléchargement"
                  linkProps={{
                    href: dalle.url,
                    title: `Télécharger la dalle ${dalle.name}`,
                    "aria-label": `Télécharger la dalle ${dalle.name}`,
                  }}
                />
              </div>
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
      </Accordion>

      <div className="fr-grid-row fr-grid-row--gutters">
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
        {/* <ModalComponent></ModalComponent> */}
      </div>
    </>
  );
};

export default SelectedTiles;