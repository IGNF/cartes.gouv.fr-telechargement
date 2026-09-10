import { defineStore } from "pinia";
import type { FilterDate } from "../assets/@types/types";

export const useFilterStore = defineStore("filter", {
  state: () => ({
    filter: { dateStart: null, dateEnd: Date.now() } as FilterDate,
    isFilteredActive: false,
  }),
  actions: {
    setFilterOnChange(filter: FilterDate) {
      this.filter = filter;
    },
    resetFilter() {
      this.filter = { dateStart: null, dateEnd: Date.now() };
    },
  },
});