import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { getRouteApi } from "@tanstack/react-router";
import { useDalleStore } from "../hooks/Store/useDalleStore";
import { useMapStore } from "../hooks/Store/useMapStore";

const route = getRouteApi("/$downloadUrl");

const Menu = () => {
  const { downloadUrl } = route.useParams();
  const selectedDalles = useDalleStore((state) => state.selectedProduits);
  const removeDalle = useDalleStore((state) => state.removeProduit);
  const clearDalles = useDalleStore((state) => state.removeAllProduits);
  const map = useMapStore((state)=> state.map)

  const onDownload = () => {
    const contenu = selectedDalles.map((dalle) => dalle.url).join("\n");
    const blob = new Blob([contenu], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${downloadUrl}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  return (
    <div className="fr-container fr-mt-3w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-10 fr-col-lg-12">
          {selectedDalles.length > 0 ? (
            <>
              <h3 className="fr-h3">Dalles sélectionnées</h3>
              <p className="fr-text--sm">
                Sélectionnez les dalles qui vous intéressent, puis téléchargez la liste des liens pour les récupérer.
              </p>

              <Accordion className="fr-mb-2w" label={`Dalles sélectionnées (${selectedDalles.length})`} defaultExpanded="true">
                <ul className="fr-mb-2w" style={{ maxHeight: "200px", overflowY: "auto", padding: "10px", borderRadius: "5px" }}>
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
                        onClick={() => removeDalle(dalle.id)}
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
                  size="lg"
                  iconId="fr-icon-download-line"
                  onClick={onDownload}
                  className="fr-mr-2w"
                  title="Télécharger la liste des liens des dalles sélectionnées"
                  aria-label="Télécharger la liste des liens des dalles sélectionnées"
                >
                  Télécharger la liste
                </Button>
                <Button
                  size="lg"
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
          ) : (
            <div className="fr-text--lead fr-mb-2w">
              <p>
                Cette interface vous permet de visualiser les données disponibles dans votre zone d'intérêt et de récupérer une liste de liens pour les télécharger.
              </p>
              <p>
                Cliquez sur une zone d'intérêt pour sélectionner des dalles et voir les options de téléchargement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
