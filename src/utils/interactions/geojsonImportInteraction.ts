import { Interaction } from "ol/interaction";
import { Map } from "ol";
import { Dalle } from "../../assets/@types/types";
import { selectDallesFromGeoJson, addGeoJsonLayerToMap } from "./geojsonInteraction";

/**
 * Interaction pour importer et traiter les fichiers GeoJSON
 * Similaire à SelectedPolygonInteraction et SelectedClickInteraction
 */
export class GeoJsonImportInteraction extends Interaction {
  private selectionLayer: any;
  private isProduitSelected: (id: string | number | undefined) => boolean;
  private addProduit: (produit: any) => void;
  private removeProduit?: (id: string | number | undefined) => void;
  private fileInput!: HTMLInputElement;
  private dropZone!: HTMLDivElement;
  private mapInstance: Map | null = null;

  constructor(
    selectionLayer: any,
    isProduitSelected: (id: string | number | undefined) => boolean,
    addProduit: (produit: any) => void,
    removeProduit?: (id: string | number | undefined) => void
  ) {
    super();
    this.selectionLayer = selectionLayer;
    this.isProduitSelected = isProduitSelected;
    this.addProduit = addProduit;
    this.removeProduit = removeProduit;
    this.fileInput = document.createElement("input");
    this.dropZone = document.createElement("div");

    // Créer l'interface de drag-drop
    this.setupUI();
  }

  /**
   * Définit l'instance de la carte (appelée automatiquement par OpenLayers)
   */
  setMap(map: Map | null): void {
    super.setMap(map);
    if (map) {
      this.mapInstance = map;
      // Ajouter la zone de dépôt au DOM de la carte
      if (this.dropZone && map.getTargetElement()) {
        map.getTargetElement().appendChild(this.dropZone);
      }
    } else if (this.dropZone && this.dropZone.parentElement) {
      this.dropZone.parentElement.removeChild(this.dropZone);
    }
  }

  /**
   * Configure l'interface utilisateur (zone de dépôt et input fichier)
   */
  private setupUI() {
    // L'input fichier est déjà créé dans le constructeur
    this.fileInput.type = "file";
    this.fileInput.accept = ".geojson,.json";
    this.fileInput.style.display = "none";
    document.body.appendChild(this.fileInput);

    // La zone de dépôt est déjà créée dans le constructeur
    this.dropZone.className = "ol-geojson-import ol-unselectable ol-control";
    this.dropZone.innerHTML = '<div class="ol-geojson-import__drop-zone"><span class="fr-icon-upload-line"></span></div>';
    this.dropZone.title = "Importer un GeoJSON";

    // Événements
    const dropElement = this.dropZone.querySelector(".ol-geojson-import__drop-zone") as HTMLElement;
    dropElement.addEventListener("click", () => this.fileInput.click());
    dropElement.addEventListener("dragover", (e) => this.handleDragOver(e));
    dropElement.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    dropElement.addEventListener("drop", (e) => this.handleDrop(e));
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.add("drag-over");
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove("drag-over");
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const dropElement = this.dropZone.querySelector(".ol-geojson-import__drop-zone") as HTMLElement;
    dropElement?.classList.remove("drag-over");

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
        this.processFile(file);
      } else {
        this.showNotification("Erreur", "Veuillez sélectionner un fichier GeoJSON ou JSON valide");
      }
    }
  }

  private handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const geojson = JSON.parse(content);

        // Valider le GeoJSON
        if (!this.isValidGeoJson(geojson)) {
          throw new Error("Format GeoJSON invalide");
        }

        // Vérifier que la carte est initialisée
        if (!this.mapInstance) {
          throw new Error("La carte n'est pas initialisée");
        }

        // Ajouter le GeoJSON à la carte
        console.log("Ajout du GeoJSON à la carte...");
        addGeoJsonLayerToMap(geojson, this.mapInstance);
        console.log("GeoJSON ajouté avec succès");

        // Sélectionner les dalles qui intersectent
        const performSelection = () => {
          console.log("Exécution de la sélection des dalles...");
          selectDallesFromGeoJson(
            geojson,
            this.selectionLayer,
            this.isProduitSelected,
            this.addProduit,
            this.removeProduit
          );
        };

        // Attendre le chargement des tuiles
        const source = this.selectionLayer.getSource?.();
        if (source && typeof source.on === "function") {
          console.log("Ajout d'un listener pour le chargement des tuiles...");
          
          let tileLoadCount = 0;
          let tileLoadTimeout: NodeJS.Timeout | null = null;
          
          const handleTileLoad = () => {
            tileLoadCount++;
            console.log(`Tuile chargée (${tileLoadCount})`);
            
            if (tileLoadTimeout) clearTimeout(tileLoadTimeout);
            
            tileLoadTimeout = setTimeout(() => {
              console.log("Attente du chargement terminée, exécution de la sélection");
              if (typeof source.un === "function") {
                source.un("tileloadend", handleTileLoad);
              }
              performSelection();
            }, 500);
          };
          
          source.on("tileloadend", handleTileLoad);
          
          setTimeout(() => {
            console.log("Timeout de 3s atteint, exécution de la sélection");
            if (typeof source.un === "function") {
              source.un("tileloadend", handleTileLoad);
            }
            if (tileLoadTimeout) clearTimeout(tileLoadTimeout);
            performSelection();
          }, 3000);
        } else {
          console.log("Source sans événement, utilisation d'un timeout...");
          setTimeout(() => {
            performSelection();
          }, 3000);
        }

        this.showNotification(
          "Succès",
          "GeoJSON importé avec succès.",
          "success"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur lors du traitement du fichier";
        this.showNotification("Erreur", message, "error");
        console.error("Erreur import GeoJSON:", error);
      }
    };

    reader.onerror = () => {
      this.showNotification("Erreur", "Erreur lors de la lecture du fichier");
    };

    reader.readAsText(file);
    this.fileInput.value = "";
  }

  private isValidGeoJson(geojson: any): boolean {
    if (!geojson || typeof geojson !== "object") {
      return false;
    }

    return (
      (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) ||
      (geojson.type === "Feature" && geojson.geometry)
    );
  }

  private showNotification(title: string, message: string, type: "success" | "error" = "error") {
    const notification = document.createElement("div");
    notification.className = `geojson-notification geojson-notification--${type}`;
    notification.innerHTML = `
      <div class="geojson-notification__content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
}
