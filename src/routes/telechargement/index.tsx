import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/telechargement/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="fr-container fr-mt-3w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8">
          <h1 className="fr-h1 fr-text--center">Bienvenue sur l'interface cartographique de téléchargement</h1>
          <p className="fr-text--lg fr-text--center">
            Cette interface est disponible pour certaines données du catalogue de cartes.gouv.fr.
          </p>
          <div className="fr-text--center fr-mt-3w">
            <a href="https://cartes.gouv.fr/catalogue" className="fr-btn">
              Accéder au catalogue
            </a>
          </div>
          <p className="fr-text--lg fr-text--center fr-mt-3w">Cette interface vous permet :</p>
          <ul className="fr-list fr-list--center">
            <li>de visualiser le tableau d'assemblage des données disponibles sur le territoire</li>
            <li>de sélectionner les emprises qui vous intéressent</li>
            <li>de télécharger les données sur les emprises sélectionnées</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
