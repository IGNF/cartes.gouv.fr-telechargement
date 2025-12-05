import { Button } from "@codegouvfr/react-dsfr/Button";
import { Download } from "@codegouvfr/react-dsfr/Download";
import DownloadModal, {downloadModal} from "./DownloadModal";
import "./styles/SelectedTiles.css";
import EmptyState from "./EmptyState";


const SelectedTiles = ({ selectedDalles, onDownload, removeDalle, clearDalles }) => {
  return (
    <div className="SelectedTilesContainer">
    <div className="SelectedTilesContainer-title">
      <h5>Dalles sélectionnées</h5>
      {selectedDalles.length > 0 ? (
        <div className="SelectedTilesContainer-title-buttons">
          <Button
            size="small"
            iconId="fr-icon-download-line"
            onClick={() => downloadModal.open()}
            priority="primary"
            title="Télécharger toutes les dalles sélectionnées"
            aria-label="Télécharger toutes les dalles sélectionnées"
          />
          <DownloadModal />
          <Button
            size="small"
            iconId="fr-icon-delete-line"
            onClick={clearDalles}
            priority="secondary"
            title="Effacer toutes les dalles sélectionnées"
            aria-label="Effacer toutes les dalles sélectionnées"
          />
        </div>
      ) : null}
    </div>
    {selectedDalles.length > 0 ? (
      <ul>
        {selectedDalles.map((dalle, index) => (
          <li key={index} className="SelectedTilesContainer-list-item">
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
                onClick={() => removeDalle(dalle.id)}
                priority="tertiary no outline"
                size="small"
                title={`Supprimer la dalle ${dalle.name}`}
                aria-label={`Supprimer la dalle ${dalle.name}`}
              />
          </li>
        ))}
      </ul>
    ) : <EmptyState />}
    </div>
  );
};

export default SelectedTiles;