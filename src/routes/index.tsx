import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="fr-container fr-mt-3w">
      <h1 className="fr-h1">Bienvenue sur l'Interface de Téléchargement</h1>
      <p className="fr-text--lg">
        Cette application vous permet de visualiser et de télécharger des
        données géographiques via une carte interactive.
      </p>
      <ul className="fr-list">
        <li>Explorez les données disponibles sur la carte.</li>
        <li>Sélectionnez les dalles géographiques qui vous intéressent.</li>
        <li>Téléchargez les données sélectionnées en quelques clics.</li>
      </ul>
      <p className="fr-text--sm">
        Pour commencer, veuillez fournir un paramètre valide dans l'URL, tel que{" "}
        <code>
        https://cartes.gouv.fr/telechargement/{"{"}votre-paramètre{"}"}
        </code>
        .
      </p>
    </div>
  );
}
