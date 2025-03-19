import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { getRouteApi } from "@tanstack/react-router";
import { useDalleStore } from "../hooks/Store/useDalleStore";
const route = getRouteApi("/download/$downloadUrl");

const Menu = ({
}: {
}) => {
  // On récupère le nom du produit
  const { downloadUrl } = route.useParams();

  //On récupère du store les dalles selectionné 
  const selectedDalles = useDalleStore((state)=> state.selectedDalles);
  // on récupère la fonction peremettant de supprimer une dalle du store
  const removeDalle = useDalleStore((state)=> state.removeDalle);


  // Fonction permettant de télécharger le fichier avec les liens pour vers les dalles seléctionné
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
    a.download = downloadUrl;
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
      {selectedDalles.length > 0 ? (
        <>
          <h3>Dalles sélectionnées</h3>
          Sélectionnez les dalles qui vous intéressent puis téléchargez la liste des liens pour les récupérer. 
          <Accordion className="fr-m-1w" label="Dalles séléctionné">
            <ul
              style={{
                maxHeight: "200px", // Hauteur maximale
                overflowY: "auto", // Défilement vertical activé
                overflowX: "hidden", // Désactive le défilement horizontal
                paddingRight: "10px", // Optionnel : espace pour la barre de défilement
              }}
            >
              {selectedDalles.map((dalle, index) => (
                <li key={index}>
                  <strong>Nom :</strong>
                  <br />
                  <Download
                    details=""
                    label={dalle.name}
                    linkProps={{ href: dalle.url }}
                  />
                  <Button
                    iconId="fr-icon-delete-line"
                    onClick={() => removeDalle(dalle.id)}
                    priority="tertiary no outline"
                  />
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
        <div className="fr-text--lead">
          Cette interface vous permet de visualiser les données disponibles dans
          votre zone d'intérêt et de récupérer une liste de liens pour les
          télécharger. <br />
          Cliquez sur la zone d'intérêt souhaitée pour consulter
          les données disponibles.
        </div>
      )}
    </div>
  );
};

export default Menu;
