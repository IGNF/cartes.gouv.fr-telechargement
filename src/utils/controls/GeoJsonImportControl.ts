import Control from "ol/control/Control";
import { Map } from "ol";
import {
  selectDallesFromGeoJson,
  addGeoJsonLayerToMap,
  waitForRenderAndSelect,
} from "../interactions/geojsonInteraction";
import useDalleStore from "../../hooks/store/useDalleStore";

export class GeoJsonImportControl extends Control {
  private fileInput: HTMLInputElement;
  private dropZone: HTMLDivElement;
  // Référence directe à la couche, comme SelectedPolygonInteraction
  private selectionLayer: any;

  constructor(selectionLayer: any) {
    const element = document.createElement("div");
    element.className = "ol-geojson-import ol-unselectable ol-control";
    super({ element });

    this.selectionLayer = selectionLayer;

    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = ".geojson,.json";
    this.fileInput.style.display = "none";
    document.body.appendChild(this.fileInput);

    this.dropZone = document.createElement("div");
    this.dropZone.className = "ol-geojson-import__drop-zone";
    this.dropZone.title = "Importer un GeoJSON";
    this.dropZone.innerHTML = '<span class="fr-icon-upload-line"></span>';

    this.dropZone.addEventListener("click", () => this.fileInput.click());
    this.dropZone.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.dropZone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    this.dropZone.addEventListener("drop", (e) => this.handleDrop(e));
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

    element.appendChild(this.dropZone);
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.add("drag-over");
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove("drag-over");
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove("drag-over");
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.name.endsWith(".geojson") || file.name.endsWith(".json"))) {
      this.processFile(file);
    } else {
      this.showNotification("Erreur", "Veuillez sélectionner un fichier GeoJSON ou JSON valide");
    }
  }

  private handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File) {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);

        if (!this.isValidGeoJson(geojson)) throw new Error("Format GeoJSON invalide");

        // Utiliser this.getMap() — API native du Control OL
        const map = this.getMap();
        if (!map) throw new Error("La carte n'est pas accessible");
        if (!this.selectionLayer) throw new Error("La couche de sélection n'est pas définie");

        // Lecture fraîche des callbacks store
        const { isProduitSelected, addProduit, removeProduit } = useDalleStore.getState();

        console.log("[GeoJSON Import] selectionLayer:", this.selectionLayer.get?.("name"));
        console.log("[GeoJSON Import] map ok:", !!map);

        // 1. Afficher le GeoJSON (zoom instantané → déclenche le rendu)
        addGeoJsonLayerToMap(geojson, map);

        // 2. Attendre rendercomplete puis sélectionner avec la même ref de couche
        //    que SelectedPolygonInteraction
        waitForRenderAndSelect(map, () => {
          selectDallesFromGeoJson(
            geojson,
            this.selectionLayer,
            (id) => isProduitSelected(id as string),
            addProduit,
            (id) => removeProduit(id as string)
          );
        });

        this.showNotification("Succès", "GeoJSON importé avec succès.", "success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur lors du traitement du fichier";
        this.showNotification("Erreur", message, "error");
        console.error("[GeoJSON Import] Erreur:", error);
      }
    };

    reader.onerror = () => this.showNotification("Erreur", "Erreur lors de la lecture du fichier");
    reader.readAsText(file);
    this.fileInput.value = "";
  }

  private isValidGeoJson(geojson: any): boolean {
    if (!geojson || typeof geojson !== "object") return false;
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

export function addGeoJsonImportControl(map: Map, selectionLayer: any) {
  const control = new GeoJsonImportControl(selectionLayer);
  map.addControl(control);
  return control;
}
