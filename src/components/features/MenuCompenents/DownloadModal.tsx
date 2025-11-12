import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useDalleStore } from "../../../hooks/store/useDalleStore";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import "./styles/DownloadModal.css";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState, useEffect } from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";

export const downloadModal = createModal({
  id: "download-modal",
  isOpenedByDefault: false,
});

interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection: NetworkInformation;
}

const DownloadModal = () => {
  const selectedDalles = useDalleStore((state) => state.selectedProduits);
  const [value, setValue] = useState("");
  const [downloadMethod, setDownloadMethod] = useState("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [fileSizes, setFileSizes] = useState<number>(0);

  const formatBytes = (bytes = 0): string => {
    if (bytes === 0) return "0 octets";
    const k = 1024;
    const sizes = ["octets", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Fonction pour obtenir la vitesse de connexion en Mo/s
  const getConnectionSpeed = (): number => {
    try {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection && connection.downlink) {
        // downlink est en Mbps, on convertit en Mo/s (1 Mbps = 0.125 Mo/s)
        return connection.downlink * 0.125 * 1024 * 1024;
      }
    } catch (error) {
      console.warn("Impossible d'obtenir la vitesse de connexion:", error);
    }
    // Valeur par défaut si on ne peut pas obtenir la vitesse réelle
    return 1024 * 1024; // 1 Mo/s
  };

  // Fonction pour calculer le temps estimé
  const calculateEstimatedTime = async (
    urls: string[],
    shouldEstimate = false
  ) => {
    try {
      const connectionSpeed = getConnectionSpeed();
      let totalSize = 0;
      const sizesMap: Record<string, number> = {};

      // Récupérer la taille de tous les fichiers
      await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url, { method: "HEAD" });
          const size = parseInt(response.headers.get("content-length") || "0");
          console.log(`Taille du fichier ${url}: ${size} octets`);
          console.log(
            `Vitesse de connexion estimée: ${connectionSpeed / (1024 * 1024)} Mo/s`
          );

          sizesMap[url] = size;
          totalSize += size;
        })
      );

      // stocker les tailles quoi qu'il arrive
      setFileSizes(totalSize);

      // calculer le temps estimé seulement si demandé (ex: downloadMethod === 'all')
      if (shouldEstimate) {
        const estimatedSeconds = totalSize / connectionSpeed;
        if (estimatedSeconds < 60) {
          setEstimatedTime(`environ ${Math.ceil(estimatedSeconds)} secondes`);
        } else if (estimatedSeconds < 3600) {
          setEstimatedTime(
            `environ ${Math.ceil(estimatedSeconds / 60)} minutes`
          );
        } else {
          const hours = Math.floor(estimatedSeconds / 3600);
          const minutes = Math.ceil((estimatedSeconds % 3600) / 60);
          setEstimatedTime(`environ ${hours}h${minutes}min`);
        }
      } else {
        setEstimatedTime("");
      }
    } catch (error) {
      console.error("Erreur lors du calcul du temps estimé:", error);
      setEstimatedTime("impossible d'estimer le temps");
      setFileSizes(0);
    }
  };

  // Toujours récupérer les tailles quand les dalles changent (et estimer si downloadMethod === 'all')
  useEffect(() => {
    if (selectedDalles.length > 0) {
      calculateEstimatedTime(
        selectedDalles.map((d) => d.url),
        downloadMethod === "all"
      );
    } else {
      setEstimatedTime("");
      setFileSizes(0);
    }
  }, [selectedDalles, downloadMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || !downloadMethod) {
      alert(
        "Veuillez sélectionner une option et une méthode de téléchargement"
      );
      return;
    }

    if (downloadMethod === "all") {
      try {
        // Redirection vers chaque URL de téléchargement
        selectedDalles.forEach((dalle) => {
          window.open(dalle.url, "_blank");
        });
      } catch (error) {
        console.error("Erreur lors du téléchargement:", error);
        alert("Une erreur est survenue lors du téléchargement");
      }
    } else {
      // Téléchargement de la liste des liens
      try {
        const contenu = selectedDalles.map((dalle) => dalle.url).join("\n");
        const blob = new Blob([contenu], { type: "text/plain" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `dalles.txt`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Erreur lors de la génération des liens:", error);
        alert("Une erreur est survenue lors de la génération des liens");
      }
    }

    // Fermer la modal après le téléchargement
    downloadModal.close();
  };

  // Fonction pour réinitialiser le formulaire
  const handleReset = () => {
    setValue("");
    setDownloadMethod("");
    setEstimatedTime("");
    downloadModal.close();
  };

  return (
    <downloadModal.Component title="Télécharger" iconId="fr-icon-download-fill">
      <form className="download-modal-form" onSubmit={handleSubmit}>
        {(() => {
          const count = selectedDalles.length;
          return (
            <p className="fr-message fr-message--info">
              {count} {count === 1 ? "dalle sélectionnée" : "dalles sélectionnées"}
              {", "}
              {count === 1 ? "taille du fichier : " : "tailles totales des fichiers : "}
              {formatBytes(fileSizes)}
            </p>
          );
        })()}

        {/* warning moved below the RadioButtons so it appears under the "Téléchargement automatique" option */}

        <div className="download-modal-content">
          <div className="download-options">
            <Select
              label="Donnée associée"
              nativeSelectProps={{
                onChange: (event) => setValue(event.target.value),
                value,
              }}
            >
              <option value="" disabled hidden>
                Selectionnez une option
              </option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
            </Select>
          </div>

          <div className="download-method">
            <RadioButtons
              name="my-radio"
              options={[
                {
                  label: "Téléchargement automatique",
                  hintText:
                    "Lancer le téléchargement automatiquement de l'ensemble des données",
                  nativeInputProps: {
                    value: "all",
                    onChange: (e) => setDownloadMethod(e.target.value),
                  },
                },
                {
                  label: "Lien de téléchargement",
                  hintText:
                    "Télécharger la liste des liens de téléchargement associés aux données",
                  nativeInputProps: {
                    value: "file",
                    onChange: (e) => setDownloadMethod(e.target.value),
                  },
                },
              ]}
            />
          </div>
        </div>
        <div
          className="download-modal-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {downloadMethod === "all" ? (
            <p className="fr-message fr-message--warning" style={{ margin: 0 }}>
              {estimatedTime ? (
                <small>Temps de téléchargement estimé: {estimatedTime}</small>
              ) : (
                <small>⏳ Calcul du temps de téléchargement en cours...</small>
              )}
            </p>
          ) : (
            <div /> /* placeholder to keep spacing when no warning */
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <Button priority="primary" type="submit">
              Télécharger
            </Button>
            <Button priority="secondary" type="button" onClick={handleReset}>
              Annuler
            </Button>
          </div>
        </div>
      </form>
    </downloadModal.Component>
  );
};

export default DownloadModal;
