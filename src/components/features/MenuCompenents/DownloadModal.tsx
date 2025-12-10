import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useDalleStore } from "../../../hooks/store/useDalleStore";
import "./styles/DownloadModal.css";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useState, useEffect } from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";
import { useDownload } from "../../../hooks/useDownload";

export const downloadModal = createModal({
  id: "download-modal",
  isOpenedByDefault: false,
});

const DownloadModal = () => {
  const selectedDalles = useDalleStore((s) => s.selectedProduits);
  const isMetadata = useDalleStore((s) => s.isMetadata);
  const [value, setValue] = useState("");
  const [downloadMethod, setDownloadMethod] = useState("");
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const resolveSizes = async () => {
      let sum = 0;
      for (const dalle of selectedDalles) {
        try {
          const size = await dalle.size; // attendre la Promise
          console.log(dalle.size);
          console.log(size);

          sum += size["human"] || 0;
        } catch (e) {
          // fallback si la Promise échoue
        }
      }
      setTotalSize(sum);
    };
    resolveSizes();
  }, [selectedDalles]);

  const formatBytes = (bytes = 0): string => {
    if (!bytes) return "0 octets";
    const k = 1024;
    const sizes = ["octets", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadMethod) {
      alert(
        "Veuillez sélectionner une option et une méthode de téléchargement"
      );
      return;
    }
    if (downloadMethod === "all") {
      selectedDalles.forEach((d: any) => window.open(d.url, "_blank"));
    } else {
      const contenu = selectedDalles.map((d: any) => d.url).join("\n");
      const blob = new Blob([contenu], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dalles.txt";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }
    downloadModal.close();
  };

  const handleReset = () => {
    setValue("");
    setDownloadMethod("");
    downloadModal.close();
  };

  const count = selectedDalles.length;
  return (
    <downloadModal.Component title="Télécharger" iconId="fr-icon-download-fill">
      <form className="download-modal-form" onSubmit={handleSubmit}>
        {<p className="fr-message fr-message--info">
          {count} {count === 1 ? "dalle sélectionnée" : "dalles sélectionnées"},{" "}
          {count === 1
            ? "taille du fichier : "
            : "tailles totales des fichiers : "}
          {formatBytes(totalSize)}
        </p>}

        <div className="download-modal-content">
          {isMetadata && (
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
          )}

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
                  label: "Liens de téléchargement",
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
            // <p className="fr-message fr-message--warning" style={{ margin: 0 }}>
            //   <small>Temps de téléchargement estimé: {estimatedTime}</small>
            // </p>
            <div /> /* placeholder to keep spacing when no warning */
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
