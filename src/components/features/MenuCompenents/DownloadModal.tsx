import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useDalleStore } from "../../../hooks/store/useDalleStore";
import "./styles/DownloadModal.css";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState, useEffect, useRef } from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";
import { formatBytes } from "../../../utils/formatters";
import { downloadZip, getFileSizes, DownloadPhase } from "../../../utils/download";
import { Dalle } from "../../../assets/@types/types";

/** Instance du modal de téléchargement, partageable pour l'ouvrir/fermer depuis l'extérieur. */
export const downloadModal = createModal({
  id: "download-modal",
  isOpenedByDefault: false,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Nombre maximum de produits autorisés pour le téléchargement automatique (ZIP). */
const MAX_PRODUITS_ZIP = 15;

/** Méthode de téléchargement choisie par l'utilisateur. */
type DownloadMethod = "all" | "file" | "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Libellés affichés pour chaque phase de téléchargement. */
const PHASE_LABELS: Record<DownloadPhase, string> = {
  idle: "",
  preparing: "Préparation du téléchargement...",
  downloading: "Téléchargement des fichiers en cours...",
  compressing: "Compression de l'archive ZIP...",
};

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
 * Génère et télécharge un unique `metadonnees.json` agrégeant les métadonnées
 * de tous les produits, indexées par nom de produit.
 *
 * Structure :
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
 *   Respecte la limite de 10 requêtes/seconde du serveur.
 *   Affiche la phase en cours (préparation / téléchargement / compression).
 *   Demande confirmation avant d'annuler si un téléchargement est en cours.
 *
 * - **Liens de téléchargement** : `Liens_de_telechargement.txt` + `metadonnees.json`.
 *
 * Si `isMetadata` est vrai, l'utilisateur doit choisir une option dans le
 * <Select> avant de pouvoir soumettre.
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

  /** Phase courante du téléchargement (pour afficher un label précis). */
  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>("idle");

  /**
   * Référence vers l'AbortController actif.
   * Permet d'annuler le téléchargement en cours depuis n'importe quel handler.
   */
  const abortControllerRef = useRef<AbortController | null>(null);

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
   * - "all"  : ZIP avec rate-limiting 10 req/s, phases affichées, annulable.
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
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsDownloadLoading(true);
      setDownloadProgress(0);
      setDownloadPhase("idle");

      try {
        await downloadZip(
          selectedProduits.map((p) => ({
            url: p.url,
            name: p.name,
            ...(isMetadata && p.metadata ? { metadata: p.metadata } : {}),
          })),
          setDownloadProgress,
          setDownloadPhase,
          fileSizes,
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Téléchargement annulé volontairement — pas d'erreur à afficher
          console.info("Téléchargement annulé par l'utilisateur.");
        } else {
          console.error("Erreur pendant le téléchargement :", err);
        }
      } finally {
        setIsDownloadLoading(false);
        setDownloadProgress(0);
        setDownloadPhase("idle");
        abortControllerRef.current = null;
      }

      downloadModal.close();
      return;
    }

    // Méthode "file"
    triggerFileDownload(
      buildUrlFileContent(selectedProduits),
      "Liens_de_telechargement.txt"
    );

    if (isMetadata) {
      downloadAggregatedMetadata(selectedProduits);
    }

    downloadModal.close();
  };

  /**
   * Tente de fermer le modal.
   * Si un téléchargement est en cours, demande confirmation avant d'annuler.
   */
  const handleClose = () => {
    if (isDownloadLoading) {
      const confirmed = window.confirm(
        "Un téléchargement est en cours. Voulez-vous vraiment l'annuler ?"
      );
      if (!confirmed) return;

      abortControllerRef.current?.abort();
    }

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

  /**
   * Le téléchargement automatique est bloqué si plus de MAX_PRODUITS_ZIP
   * produits sont sélectionnés. L'utilisateur doit utiliser les liens à la place.
   */
  const isTooManyProduits =
    downloadMethod === "all" && produitCount > MAX_PRODUITS_ZIP;

  return (
    <downloadModal.Component
      title="Télécharger"
      iconId="fr-icon-download-fill"
      concealingBackdrop={false}
      buttons={[]}
    >
      {isDownloadLoading ? (
        /* --- Barre de progression avec phase --- */
        <div className="download-progress-container">
          <p>{PHASE_LABELS[downloadPhase]}</p>
          {downloadPhase === "downloading" && (
            <p className="progress-file-count">
              {Math.round((downloadProgress / 99) * produitCount)}/{produitCount} fichiers
            </p>
          )}
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button priority="secondary" type="button" onClick={handleClose}>
              Annuler le téléchargement
            </Button>
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
                    hintText: isMetadata
                      ? "Télécharger un ZIP avec un sous-dossier par produit (données + métadonnées)"
                      : "Lancer le téléchargement automatique de l'ensemble des données",
                    nativeInputProps: {
                      value: "all",
                      defaultChecked: true,
                      onChange: (e) =>
                        setDownloadMethod(e.target.value as DownloadMethod),
                    },
                  },
                  {
                    label: "Liens de téléchargement",
                    hintText: isMetadata
                      ? "Télécharger la liste des liens et un fichier metadonnees.json indexé par produit"
                      : "Télécharger la liste des liens de téléchargement associés aux données",
                    nativeInputProps: {
                      value: "file",
                      onChange: (e) =>
                        setDownloadMethod(e.target.value as DownloadMethod),
                    },
                  },
                ]}
              />

              {downloadMethod === "all"  && !isTooManyProduits && (
                <p className="fr-message fr-message--warning">
                  <small>
                    Ce téléchargement peut nécessiter un certain temps.
                    Assurez-vous de disposer d'une connexion Internet stable
                    avant de continuer.
                  </small>
                </p>
              )}

              {isTooManyProduits && (
                <p className="fr-message fr-message--error">
                  <small>
                    Le téléchargement automatique est limité à {MAX_PRODUITS_ZIP} produits.
                    Vous en avez sélectionné {produitCount}. Utilisez les liens de
                    téléchargement ou réduisez votre sélection.
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
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Button
              priority="primary"
              type="submit"
              disabled={isSubmitDisabled || isTooManyProduits}
            >
              Télécharger
            </Button>
          </div>
        </form>
      )}
    </downloadModal.Component>
  );
};

export default DownloadModal;
