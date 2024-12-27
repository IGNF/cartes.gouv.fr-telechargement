import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { MouseEventHandler } from "react";

function Menu({
  selectedDalles,
  title,
}: {
  selectedDalles: any[];
  title: string;
}) {
  const onDownload = () => {
    // variable qui aura le contenu
    let contenu = "";
    // ajout de chaque dalle dans le contenu du txt
    selectedDalles.forEach((dalle: any) => {
      contenu += dalle.url + "\n";
    });
    // Créer un objet Blob avec le contenu texte
    const blob = new Blob([contenu], { type: "text/plain" });
    // Créer une URL pour le Blob
    const blobUrl = URL.createObjectURL(blob);
    // Créer un lien pour le téléchargement du fichier
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = title;
    a.style.display = "none";
    document.body.appendChild(a);
    // Déclencher le téléchargement
    a.click();
    // Nettoyer après le téléchargement
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  return (
    <div className="fr-m-1w">
      <h3>Dalles sélectionnées</h3>
      {selectedDalles.length > 0 ? (
        <>
          <Accordion className="fr-m-1w" label="Dalles séléctionné">
            <ul>
              {selectedDalles.map((dalle, index) => (
                <li key={index}>
                  <strong>Nom :</strong>
                  <br />
                  <Download
                    details=""
                    label={dalle.name}
                    linkProps={{ href: dalle.url }}
                  ></Download>
                  {/* Ajoutez d'autres propriétés ici si nécessaire */}
                </li>
              ))}
            </ul>
          </Accordion>
          <Button
            size="large"
            iconId="fr-icon-download-line"
            onClick={onDownload}
          >
            Télécharger la liste des liens
          </Button>
        </>
      ) : (
        <p>Aucune dalle sélectionnée</p>
      )}
    </div>
  );
}

export default Menu;
