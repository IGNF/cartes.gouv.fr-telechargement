<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDalleStore } from "../stores/dalle";
import { useFilterStore } from "../stores/filter";
import { downloadZip, getFileSizes, type DownloadPhase } from "../utils/download";
import { formatBytes } from "../utils/formatters";

const props = defineProps<{ downloadUrl: string }>();
const dalleStore = useDalleStore();
const filterStore = useFilterStore();
const { selectedProduits, totalSize } = storeToRefs(dalleStore);
const isFilterOpen = ref(false);
const isDownloadOpen = ref(false);
const isHelpOpen = ref(false);
const downloadMethod = ref<"all" | "file">("all");
const associatedData = ref<"" | "with-metadata" | "raw-only">("");
const associatedDataError = ref(false);
const isDownloading = ref(false);
const downloadProgress = ref(0);
const downloadPhase = ref<DownloadPhase>("idle");
const fileSizes = ref<Map<string, number | null>>(new Map());
const startDate = ref(toDateInput(filterStore.filter.dateStart));
const endDate = ref(toDateInput(filterStore.filter.dateEnd));
const maxZipProducts = 15;
let abortController: AbortController | null = null;

const isTooManyProducts = computed(() => downloadMethod.value === "all" && selectedProduits.value.length > maxZipProducts);
const phaseLabel = computed(() => ({ idle: "", preparing: "Préparation du téléchargement...", downloading: "Téléchargement des fichiers en cours...", compressing: "Compression de l'archive ZIP..." })[downloadPhase.value]);
const requiresAssociatedDataChoice = computed(() => dalleStore.isMetadata);
const isSubmitDisabled = computed(() => isTooManyProducts.value || (requiresAssociatedDataChoice.value && !associatedData.value));

function toDateInput(timestamp: number | null) {
  return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : "";
}

function applyFilter() {
  const previous = { ...filterStore.filter };
  const filter = { dateStart: startDate.value ? new Date(startDate.value).getTime() : null, dateEnd: endDate.value ? new Date(endDate.value).getTime() : Date.now() };
  filterStore.setFilterOnChange(filter);
  dalleStore.filterProduits(filter);
  dalleStore.addHistoricStep([{ action: "filter", filter: previous }]);
}

function resetFilter() {
  const previous = { ...filterStore.filter };
  filterStore.resetFilter();
  startDate.value = "";
  endDate.value = toDateInput(filterStore.filter.dateEnd);
  dalleStore.filterProduits(filterStore.filter);
  dalleStore.addHistoricStep([{ action: "filter", filter: previous }]);
}

function downloadLinks() {
  const url = URL.createObjectURL(new Blob([selectedProduits.value.map((produit) => produit.url).join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "Liens_de_telechargement.txt";
  link.click();
  URL.revokeObjectURL(url);

  if (dalleStore.isMetadata && associatedData.value === "with-metadata") {
    const metadata = Object.fromEntries(selectedProduits.value.map((produit) => [produit.name, { url: produit.url, metadata: produit.metadata ?? {} }]));
    const metadataUrl = URL.createObjectURL(new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" }));
    const metadataLink = document.createElement("a");
    metadataLink.href = metadataUrl;
    metadataLink.download = "metadonnees.json";
    metadataLink.click();
    URL.revokeObjectURL(metadataUrl);
  }
}

async function openDownload() {
  isDownloadOpen.value = true;
  void loadFileSizes();
}

async function loadFileSizes() {
  const controller = new AbortController();
  try {
    const sizes = await getFileSizes(selectedProduits.value, controller.signal);
    fileSizes.value = sizes;
    for (const produit of selectedProduits.value) dalleStore.updateFileSize(produit.url, sizes.get(produit.name) ?? null);
  } catch (error) {
    console.warn("Impossible de calculer les tailles des fichiers", error);
  }
}

async function submitDownload() {
  if (isSubmitDisabled.value) {
    associatedDataError.value = requiresAssociatedDataChoice.value && !associatedData.value;
    return;
  }
  if (downloadMethod.value === "file") {
    downloadLinks();
    isDownloadOpen.value = false;
    return;
  }
  abortController = new AbortController();
  isDownloading.value = true;
  try {
    const files = selectedProduits.value.map((produit) => ({
      url: produit.url,
      name: produit.name,
      ...(associatedData.value === "with-metadata" && produit.metadata ? { metadata: produit.metadata } : {}),
    }));
    await downloadZip(files, (progress) => { downloadProgress.value = progress; }, (phase) => { downloadPhase.value = phase; }, fileSizes.value, abortController.signal);
    isDownloadOpen.value = false;
  } catch (error) {
    if ((error as Error).name !== "AbortError") console.error("Erreur de telechargement", error);
  } finally {
    isDownloading.value = false;
    downloadProgress.value = 0;
    downloadPhase.value = "idle";
    abortController = null;
  }
}

function cancelDownload() {
  abortController?.abort();
}

watch([startDate, endDate], applyFilter);
</script>

<template>
  <section v-if="isFilterOpen" class="filter">
    <button class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-arrow-left-line filter-back-button" @click="isFilterOpen = false">Retour</button>
    <div class="filter-header">
      <h1 class="fr-h5">Filtrer</h1>
      <button class="fr-btn fr-btn--secondary fr-btn--sm" @click="resetFilter">Réinitialiser</button>
    </div>
    <div class="filter-date">
      <div class="fr-input-group"><label class="fr-label" for="date-start">Date de début</label><input id="date-start" v-model="startDate" class="fr-input" type="date" /></div>
      <div class="fr-input-group"><label class="fr-label" for="date-end">Date de fin</label><input id="date-end" v-model="endDate" class="fr-input" type="date" /></div>
    </div>
  </section>
  <section v-else class="menu">
    <div class="title-menu">
      <h1 class="fr-h4">Téléchargement de données</h1>
      <button class="fr-btn fr-btn--tertiary-no-outline fr-icon-information-line title-menu-action" title="Informations sur le téléchargement de données" aria-label="Informations sur le téléchargement de données" @click="isHelpOpen = true" />
    </div>
    <div class="filter-menu"><div class="fr-input-group"><label class="fr-label" for="dataset">Jeu de données</label><input id="dataset" class="fr-input" :value="downloadUrl.replaceAll('-', ' ')" readonly aria-label="Jeu de données sélectionné" /></div><button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-equalizer-line" title="Filtrer" @click="isFilterOpen = true">Filtrer</button></div>
      <div class="SelectedTilesContainer">
        <div class="SelectedTilesContainer-title"><h2 class="fr-h5">Dalles sélectionnées</h2><div v-if="selectedProduits.length" class="SelectedTilesContainer-title-buttons"><button class="fr-btn fr-btn--sm fr-icon-download-line" title="Télécharger toutes les dalles sélectionnées" aria-label="Télécharger toutes les dalles sélectionnées" @click="openDownload" /><button class="fr-btn fr-btn--secondary fr-btn--sm fr-icon-delete-line" title="Effacer toutes les dalles sélectionnées" aria-label="Effacer toutes les dalles sélectionnées" @click="dalleStore.removeAllProduits" /></div></div>
        <p v-if="!selectedProduits.length">Choisissez un mode de sélection dans la barre d’outils, puis sélectionnez vos dalles.</p>
        <ul v-else><li v-for="dalle in selectedProduits" :key="dalle.id" class="SelectedTilesContainer-list-item" @mouseenter="dalleStore.setIsHovered(dalle.id, true)" @mouseleave="dalleStore.setIsHovered(dalle.id, false)"><a class="fr-link" :href="dalle.url" :title="`Télécharger la dalle ${dalle.name}`">{{ dalle.name }}</a><button class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line" :title="`Supprimer la dalle ${dalle.name}`" @click="dalleStore.removeProduit(dalle.id)" /></li></ul>
      </div>
  </section>
  <Teleport to="body">
    <dialog v-if="isHelpOpen" open class="fr-modal fr-modal--opened" aria-labelledby="help-title">
      <div class="fr-container fr-container--fluid fr-container-md">
        <div class="fr-grid-row fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div class="fr-modal__body">
              <div class="fr-modal__header"><button class="fr-btn--close fr-btn" title="Fermer" @click="isHelpOpen = false">Fermer</button></div>
              <div class="fr-modal__content modal-contenu">
                <h2 id="help-title" class="fr-modal__title">Comment ça marche ?</h2>
                <div><div class="modal-title-wrapper"><span class="fr-icon-equalizer-line" aria-hidden="true" /><h3 class="fr-h6">Filtrez les dalles</h3></div><p>Sélectionnez les filtres qui vous intéressent pour filtrer les dalles affichées.</p></div>
                <div><div class="modal-title-wrapper"><span class="fr-icon-france-fill" aria-hidden="true" /><h3 class="fr-h6">Sélectionnez vos dalles</h3></div><p>Après avoir choisi le mode de sélection (clic, surface, import d'emprise), cliquez d'abord sur votre zone d'intérêt, puis sur une dalle pour la sélectionner.</p></div>
                <div><div class="modal-title-wrapper"><span class="fr-icon-download-fill" aria-hidden="true" /><h3 class="fr-h6">Téléchargez les dalles</h3></div><p>Téléchargez les dalles sélectionnées : une fenêtre vous permettra de choisir le type de téléchargement et les données associées.</p></div>
                <div><div class="modal-title-wrapper"><span class="fr-icon-server-fill" aria-hidden="true" /><h3 class="fr-h6">Changez de flux</h3></div><p>Changez de flux si besoin, changez de flux visualisé et continuez vos téléchargements.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </Teleport>
  <Teleport to="body">
    <dialog v-if="isDownloadOpen" open class="fr-modal fr-modal--opened" aria-labelledby="download-title">
      <div class="fr-container fr-container--fluid fr-container-md">
        <div class="fr-grid-row fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div class="fr-modal__body">
              <div class="fr-modal__header"><button class="fr-btn--close fr-btn" title="Fermer" @click="isDownloadOpen = false">Fermer</button></div>
              <div class="fr-modal__content">
                <h2 id="download-title" class="fr-modal__title fr-icon-download-fill">Télécharger</h2>
                <template v-if="isDownloading">
                  <div class="download-progress-container">
                    <p>{{ phaseLabel }}</p>
                    <p v-if="downloadPhase === 'downloading'">{{ Math.round((downloadProgress / 99) * selectedProduits.length) }}/{{ selectedProduits.length }} fichiers</p>
                    <progress :value="downloadProgress" max="100" />
                    <span>{{ Math.round(downloadProgress) }} %</span>
                    <button class="fr-btn fr-btn--secondary" @click="cancelDownload">Annuler le téléchargement</button>
                  </div>
                </template>
                <form v-else class="download-modal-form" @submit.prevent="submitDownload">
                  <p class="fr-message fr-message--info">
                    {{ selectedProduits.length }} {{ selectedProduits.length === 1 ? 'produit sélectionné' : 'produits sélectionnés' }},
                    {{ selectedProduits.length === 1 ? 'taille du fichier :' : 'taille totale des fichiers :' }}
                    {{ totalSize === null ? 'Impossible de calculer la taille' : formatBytes(totalSize) }}
                  </p>
                  <div class="download-modal-content">
                    <div v-if="requiresAssociatedDataChoice" class="fr-select-group" :class="{ 'fr-select-group--error': associatedDataError }">
                      <label class="fr-label" for="associated-data">Donnée associée</label>
                      <select id="associated-data" v-model="associatedData" class="fr-select" @change="associatedDataError = false">
                        <option value="" disabled hidden>Sélectionnez une option</option>
                        <option value="with-metadata">Télécharger les données accompagnantes</option>
                        <option value="raw-only">Télécharger uniquement les données brutes</option>
                      </select>
                      <p v-if="associatedDataError" class="fr-error-text">Veuillez sélectionner une option avant de continuer.</p>
                    </div>
                    <fieldset class="fr-fieldset">
                      <legend class="fr-fieldset__legend">Méthode de téléchargement</legend>
                      <div class="fr-fieldset__element"><div class="fr-radio-group"><input id="automatic" v-model="downloadMethod" type="radio" value="all" /><label class="fr-label" for="automatic">Téléchargement automatique<span class="fr-hint-text">{{ requiresAssociatedDataChoice ? 'Télécharger un ZIP avec un sous-dossier par produit (données + métadonnées)' : "Lancer le téléchargement automatique de l'ensemble des données" }}</span></label></div></div>
                      <div class="fr-fieldset__element"><div class="fr-radio-group"><input id="links" v-model="downloadMethod" type="radio" value="file" /><label class="fr-label" for="links">Liens de téléchargement<span class="fr-hint-text">{{ requiresAssociatedDataChoice ? 'Télécharger la liste des liens et un fichier metadonnees.json indexé par produit' : 'Télécharger la liste des liens de téléchargement associés aux données' }}</span></label></div></div>
                    </fieldset>
                    <p v-if="downloadMethod === 'all' && !isTooManyProducts" class="fr-message fr-message--warning">Ce téléchargement peut nécessiter un certain temps. Assurez-vous de disposer d'une connexion Internet stable avant de continuer.</p>
                    <p v-if="isTooManyProducts" class="fr-message fr-message--error">Le téléchargement automatique est limité à {{ maxZipProducts }} produits. Vous en avez sélectionné {{ selectedProduits.length }}. Utilisez les liens de téléchargement ou réduisez votre sélection.</p>
                  </div>
                  <div class="download-modal-actions"><button class="fr-btn" type="submit" :disabled="isSubmitDisabled">Télécharger</button></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style>
.menu {
  display: flex;
  height: 604px;
  padding: 24px 16px;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.title-menu,
.SelectedTilesContainer-title,
.filter-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.title-menu h1,
.SelectedTilesContainer-title h2,
.filter-header h1 {
  margin: 0;
}

.title-menu-action,
.SelectedTilesContainer-title-buttons {
  margin-left: auto;
}

.filter-menu {
  display: flex;
  width: 100%;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 1rem 0;
}

.filter-menu .fr-input-group {
  flex: 1;
  margin-bottom: 0;
}

.filter-menu button {
  height: 2.5rem;
}

.filter {
  display: flex;
  width: 100%;
  min-height: 37.75rem;
  padding: 1rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.filter-back-button {
  display: flex;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  margin-bottom: 0.7rem;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.filter-header {
  min-height: 2.4375rem;
  align-items: flex-end;
  margin: 0 0.5rem;
}

.filter-date {
  display: flex;
  width: calc(100% - 2rem);
  justify-content: space-between;
  gap: 1rem;
  margin: 0 1rem;
}

.filter-date > .fr-input-group {
  flex: 1;
}

.SelectedTilesContainer {
  display: flex;
  width: 100%;
  padding: 1rem;
  flex-direction: column;
}

.SelectedTilesContainer-title {
  padding: 0.5rem 0;
}

.SelectedTilesContainer-title-buttons {
  display: flex;
  gap: 0.5rem;
}

.SelectedTilesContainer ul {
  width: 100%;
  max-height: 288px;
  padding: 0;
  margin: 1rem 0;
  overflow-y: auto;
  list-style: none;
}

.SelectedTilesContainer-list-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.download-modal-content,
.download-progress-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.download-modal-content {
  width: 100%;
  gap: 1.6875rem;
  padding: 0 0.25rem 1rem;
}

.download-progress-container {
  gap: 1.5rem;
  padding: 1rem;
}

.download-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-contenu > div {
  margin-bottom: 1.5rem;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.modal-title-wrapper .fr-icon-equalizer-line,
.modal-title-wrapper .fr-icon-france-fill,
.modal-title-wrapper .fr-icon-server-fill,
.modal-title-wrapper .fr-icon-download-fill {
  color: #000091;
  font-size: 1.25rem;
}

.modal-title-wrapper h3 {
  margin: 0;
}

@media (max-width: 768px) {
  .filter-date {
    flex-direction: column;
  }
}
</style>