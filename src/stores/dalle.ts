import { defineStore } from "pinia";
import { markRaw } from "vue";
import type { Dalle, FilterDate, HistoricStep } from "../assets/@types/types";
import { useFilterStore } from "./filter";

export const useDalleStore = defineStore("dalle", {
  state: () => ({
    selectedProduits: [] as Dalle[],
    selectedProduitsFiltered: [] as Dalle[],
    historicPastSteps: [] as HistoricStep[],
    historicFutureSteps: [] as HistoricStep[],
    fileSizes: new Map<string, number | null>(),
    totalSize: null as number | null,
    produitLayer: null as { changed: () => void } | null,
    chantierLayer: null as { changed: () => void } | null,
    isMetadata: false,
  }),
  getters: {
    isProduitSelected: (state) => (id: string) => state.selectedProduits.some((produit) => produit.id === id),
    isProduitFiltered: (state) => (id: string) => state.selectedProduitsFiltered.some((produit) => produit.id === id),
    isDalleHovered: (state) => (id: string) => state.selectedProduits.some((produit) => produit.id === id && produit.isHovered),
  },
  actions: {
    addProduit(produit: Dalle) {
      const filter = useFilterStore();
      const isInDateRange = (filter.filter.dateStart === null || produit.timestamp >= filter.filter.dateStart)
        && produit.timestamp <= filter.filter.dateEnd;
      if (isInDateRange && !this.isProduitSelected(produit.id)) this.selectedProduits.push(produit);
      this.produitLayer?.changed();
    },
    removeProduit(id: string) {
      this.selectedProduits = this.selectedProduits.filter((produit) => produit.id !== id);
      this.selectedProduitsFiltered = this.selectedProduitsFiltered.filter((produit) => produit.id !== id);
      this.produitLayer?.changed();
    },
    removeAllProduits() {
      this.selectedProduits = [];
      this.selectedProduitsFiltered = [];
      this.fileSizes = new Map();
      this.totalSize = null;
      this.produitLayer?.changed();
    },
    setIsHovered(id: string, isHovered: boolean) {
      this.selectedProduits = this.selectedProduits.map((produit) => produit.id === id ? { ...produit, isHovered } : produit);
      this.produitLayer?.changed();
    },
    addHistoricStep(step: HistoricStep) {
      this.historicPastSteps.push(step);
      this.historicFutureSteps = [];
    },
    updateFileSize(url: string, size: number | null) {
      const fileSizes = new Map(this.fileSizes);
      fileSizes.set(url, size);
      this.fileSizes = fileSizes;
      const sizes = Array.from(fileSizes.values());
      this.totalSize = sizes.length > 0 && sizes.every((value): value is number => value !== null && value > 0)
        ? sizes.reduce((total, value) => total + value, 0)
        : null;
    },
    setProduitLayer(layer: { changed: () => void } | null) {
      this.produitLayer = layer ? markRaw(layer) : null;
    },
    setChantierLayer(layer: { changed: () => void } | null) {
      this.chantierLayer = layer ? markRaw(layer) : null;
    },
    filterProduits(filter: FilterDate) {
      const isInDateRange = (produit: Dalle) => (filter.dateStart === null || produit.timestamp >= filter.dateStart)
        && produit.timestamp <= filter.dateEnd;
      const selected = [...this.selectedProduits, ...this.selectedProduitsFiltered];
      this.selectedProduits = selected.filter(isInDateRange);
      this.selectedProduitsFiltered = selected.filter((produit) => !isInDateRange(produit));
      this.produitLayer?.changed();
      this.chantierLayer?.changed();
    },
    navigateHistory(action: "undo" | "redo") {
      const source = action === "undo" ? this.historicPastSteps : this.historicFutureSteps;
      const destination = action === "undo" ? this.historicFutureSteps : this.historicPastSteps;
      const step = source.pop();
      if (!step) return;

      for (const item of step) {
        if (item.action === "filter" && item.filter) {
          const filterStore = useFilterStore();
          const currentFilter = { ...filterStore.filter };
          filterStore.setFilterOnChange(item.filter);
          this.filterProduits(item.filter);
          destination.push([{ action: "filter", filter: currentFilter }]);
          return;
        }
      }

      for (const item of step) {
        for (const dalle of item.dalles ?? []) {
          const shouldAdd = (action === "undo" && item.action === "remove") || (action === "redo" && item.action === "add");
          if (shouldAdd) this.addProduit(dalle);
          else this.removeProduit(dalle.id);
        }
      }
      destination.push(step);
    },
  },
});