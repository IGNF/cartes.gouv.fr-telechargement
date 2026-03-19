import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useDalleStore } from "../../../hooks/store/useDalleStore";
import "./styles/DownloadModal.css";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState, useEffect } from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";
import { formatBytes } from "../../../utils/formatters";
import { downloadZip, getFileSizes } from "../../../utils/download";
import { Dalle } from "../../../assets/@types/types";

/** Instance du modal de téléchargement, partageable pour l'ouvrir/fermer depuis l'extérieur. */
export const downloadModal = createModal({
  id: "download-modal",
  isOpenedByDefault: false,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Méthode de téléchargement choisie par l'utilisateur. */
type DownloadMethod = "all" | "file" | "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Génère le contenu texte d'un fichier listant les URLs des produits.
 * Une URL par ligne.
 */
const buildUrlFileContent = (produits: Dalle[]): string =>
  produits.map((p) => p.url).join("\n");

/**
 * Déclenche le téléchargement d'un fichier dans le navigateur.
 *
 * @param content  - Contenu du fichier.
 * @param filename - Nom du fichier téléchargé.
 * @param mimeType - Type MIME (défaut : text/plain).
 */
const triggerFileDownload = (
  content: string,
  filename: string,
  mimeType = "text/plain"
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
};

/**
 * Génère et télécharge un unique fichier `metadonnees.json` agrégeant les
 * métadonnées de tous les produits, indexées par nom de produit.
 *
 * Structure du fichier généré :
 * ```json
 * {
 *   "LHD_FXX_0656_6861": {
 *     "url": "https://...",
 *     "metadata": { "codebloc": "KE", ... }
 *   }
 * }
 * ```
 */
const downloadAggregatedMetadata = (produits: Dalle[]): void => {
  const aggregated = produits.reduce<
    Record<string, { url: string; metadata: Record<string, unknown> }>
  >((acc, p) => {
    acc[p.name] = { url: p.url, metadata: p.metadata ?? {} };
    return acc;
  }, {});

  triggerFileDownload(
    JSON.stringify(aggregated, null, 2),
    "metadonnees.json",
    "application/json"
  );
};

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * Modal de téléchargement des produits sélectionnés.
 *
 * Comportement selon la méthode choisie :
 *
 * - **Téléchargement automatique (ZIP)** : un sous-dossier par produit
 *   contenant le fichier de données et son `.json` de métadonnées.
 *
 * - **Liens de téléchargement** : un fichier `Liens_de_telechargement.txt`
 *   (une URL par ligne) + un `metadonnees.json` unique indexé par nom.
 *
 * Si `isMetadata` est vrai, l'utilisateur doit obligatoirement choisir une
 * option dans le <Select> avant de pouvoir soumettre le formulaire.
 */
const DownloadModal = () => {
  // ---------------------------------------------------------------------------
  // State & store
  // ---------------------------------------------------------------------------

  const selectedProduits: Dalle[] = useDalleStore((s) => s.selectedProduits);
  const isMetadata: boolean = useDalleStore((s) => s.isMetadata);

  /** Option sélectionnée dans le <Select> de donnée associée. */
  const [selectValue, setSelectValue] = useState<string>("");

  /**
   * Erreur affichée sous le <Select> si l'utilisateur tente de soumettre
   * sans avoir choisi d'option alors que des métadonnées sont disponibles.
   */
  const [selectError, setSelectError] = useState<boolean>(false);

  /** Méthode de téléchargement choisie via les radio buttons. */
  const [downloadMethod, setDownloadMethod] = useState<DownloadMethod>("all");

  /** Taille totale (en octets) des produits sélectionnés, null si inconnue. */
  const [totalSize, setTotalSize] = useState<number | null>(null);

  /** Cache des tailles individuelles, réutilisé lors du téléchargement ZIP. */
  const [fileSizes, setFileSizes] = useState<Map<string, number | null>>(
    new Map()
  );

  /** Indique si un téléchargement ZIP est en cours. */
  const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false);

  /** Progression du téléchargement ZIP (0-100). */
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Effets
  // ---------------------------------------------------------------------------

  /**
   * Récupère et met en cache les tailles des fichiers dès que la sélection change.
   * `totalSize` reste `null` si au moins une taille est inconnue.
   */
  useEffect(() => {
    const fetchFileSizes = async () => {
      if (selectedProduits.length === 0) {
        setTotalSize(null);
        setFileSizes(new Map());
        return;
      }

      try {
        const sizes = await getFileSizes(
          selectedProduits.map((p) => ({ url: p.url, name: p.name }))
        );

        setFileSizes(sizes);

        const values = Array.from(sizes.values());
        const allKnown = values.every((s) => s !== null && s > 0);

        setTotalSize(
          allKnown
            ? values.reduce<number>((acc, s) => acc + (s ?? 0), 0)
            : null
        );
      } catch (error) {
        console.error("Erreur lors du calcul des tailles :", error);
        setTotalSize(null);
      }
    };

    fetchFileSizes();
  }, [selectedProduits]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Gère la soumission du formulaire.
   *
   * - Affiche une erreur sur le <Select> si `isMetadata` est vrai et qu'aucune
   *   option n'a été choisie (le bouton est aussi désactivé dans ce cas).
   * - "all"  : ZIP structuré en sous-dossiers (données + métadonnées par produit).
   * - "file" : fichier texte des liens + `metadonnees.json` indexé par nom.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!downloadMethod) {
      alert("Veuillez sélectionner une méthode de téléchargement.");
      return;
    }

    if (isMetadata && !selectValue) {
      setSelectError(true);
      return;
    }

    if (downloadMethod === "all") {
      setIsDownloadLoading(true);
      setDownloadProgress(0);

      await downloadZip(
        selectedProduits.map((p) => ({
          url: p.url,
          name: p.name,
          ...(isMetadata && p.metadata ? { metadata: p.metadata } : {}),
        })),
        setDownloadProgress,
        fileSizes
      );

      setIsDownloadLoading(false);
      downloadModal.close();
      return;
    }

    triggerFileDownload(
      buildUrlFileContent(selectedProduits),
      "Liens_de_telechargement.txt"
    );

    if (isMetadata) {
      downloadAggregatedMetadata(selectedProduits);
    }

    downloadModal.close();
  };

  /** Remet le formulaire à son état initial et ferme le modal. */
  const handleReset = () => {
    setSelectValue("");
    setSelectError(false);
    setDownloadMethod("all");
    downloadModal.close();
  };

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  const produitCount = selectedProduits.length;

  /**
   * Le bouton "Télécharger" est désactivé si des métadonnées sont disponibles
   * et qu'aucune option n'a été choisie dans le <Select>.
   */
  const isSubmitDisabled = isMetadata && !selectValue;

  return (
    <downloadModal.Component title="Télécharger" iconId="fr-icon-download-fill">
      {isDownloadLoading ? (
        /* --- Barre de progression --- */
        <div className="download-progress-container">
          <p>Téléchargement et compression en cours...</p>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <div className="progress-info">
              <span className="progress-percentage">
                {Math.round(downloadProgress)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* --- Formulaire principal --- */
        <form className="download-modal-form" onSubmit={handleSubmit}>
          {/* Résumé de la sélection */}
          <p className="fr-message fr-message--info">
            {produitCount}{" "}
            {produitCount === 1 ? "produit sélectionné" : "produits sélectionnés"},{" "}
            {produitCount === 1
              ? "taille du fichier : "
              : "tailles totales des fichiers : "}
            {totalSize !== null
              ? formatBytes(totalSize)
              : "Impossible de calculer la taille"}
          </p>

          <div className="download-modal-content">
            {/* Sélecteur de données associées — obligatoire si isMetadata */}
            {isMetadata && (
              <div className="download-options">
                <Select
                  label="Donnée associée"
                  state={selectError ? "error" : "default"}
                  stateRelatedMessage={
                    selectError
                      ? "Veuillez sélectionner une option avant de continuer."
                      : undefined
                  }
                  nativeSelectProps={{
                    onChange: (e) => {
                      setSelectValue(e.target.value);
                      setSelectError(false);
                    },
                    value: selectValue,
                  }}
                >
                  <option value="" disabled hidden>
                    Sélectionnez une option
                  </option>
                  <option value="with-metadata">
                    Télécharger les données accompagnantes
                  </option>
                  <option value="raw-only">
                    Télécharger uniquement les données brutes
                  </option>
                </Select>
              </div>
            )}

            {/* Choix de la méthode */}
            <div className="download-method">
              <RadioButtons
                name="download-method"
                options={[
                  {
                    label: "Téléchargement automatique",
                    hintText:
                      "Lancer le téléchargement automatiquement de l'ensemble des données",
                    nativeInputProps: {
                      value: "all",
                      defaultChecked: true,
                      onChange: (e) =>
                        setDownloadMethod(e.target.value as DownloadMethod),
                    },
                  },
                  {
                    label: "Liens de téléchargement",
                    hintText:
                      "Télécharger la liste des liens de téléchargement associés aux données",
                    nativeInputProps: {
                      value: "file",
                      onChange: (e) =>
                        setDownloadMethod(e.target.value as DownloadMethod),
                    },
                  },
                ]}
              />

              {downloadMethod === "all" && (
                <p className="fr-message fr-message--warning">
                  <small>
                    Ce téléchargement peut nécessiter un certain temps.
                    Assurez-vous de disposer d'une connexion Internet stable
                    avant de continuer.
                  </small>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className="download-modal-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div />
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                priority="primary"
                type="submit"
                disabled={isSubmitDisabled}
              >
                Télécharger
              </Button>
              <Button priority="secondary" type="button" onClick={handleReset}>
                Annuler
              </Button>
            </div>
          </div>
        </form>
      )}
    </downloadModal.Component>
  );
};

export default DownloadModal;
