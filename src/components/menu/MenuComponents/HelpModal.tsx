import { createModal } from "@codegouvfr/react-dsfr/Modal";
import "./styles/HelpModal.css";

export const helpModal = createModal({
  id: "help-modal",
  isOpenedByDefault: false,
});

const HelpModal = () => {
  return (
    <helpModal.Component
      title="Comment ça marche ?"
      buttons={[
        {
          doClosesModal: true,
          children: "Fermer",
        }
      ]}
    >
      <div className="modal-contenu">
        <div>
          <div className="modal-title-wrapper">
            <span className="fr-icon-equalizer-line"></span>
            <h6>Filtrez les dalles</h6>
          </div>
          <p>Séléctionnez les filtres qui vous interessent pour filtrer les dalles affichées.</p>
        </div>
        <div>
          <div className="modal-title-wrapper">
            <span className="fr-icon-france-fill"></span>
            <h6>Sélectionnez vos dalles</h6>
          </div>
          <p>
            Après avoir choisi le mode de sélection (clic, surface, import d'emprise), 
            cliquez d'abord sur votre zone d'intérêt, puis sur une dalle pour la sélectionner.
          </p>
        </div>
        <div>
          <div className="modal-title-wrapper">
            <span className="fr-icon-download-fill"></span>
            <h6>Téléchargez les dalles</h6>
          </div>
          <p>
            Téléchargez les dalles sélectionnées : une fenêtre vous permettra de choisir 
            le type de téléchargement et les données associées.
          </p>
        </div>
        <div>
          <div className="modal-title-wrapper">
            <span className="fr-icon-server-fill"></span>
            <h6>Changez de flux</h6>
          </div>
          <p>
            Changez de flux si besoin, changez de flux visualisé et continuez vos téléchargements.
          </p>
        </div>
      </div>
    </helpModal.Component>
  );
};

export default HelpModal;