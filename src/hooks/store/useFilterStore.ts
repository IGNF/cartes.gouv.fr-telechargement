import { log } from "console";
import { create } from "zustand";

type Filter = { dateStart: number | null; dateEnd: number };


type FilterStore = {
  filter: Filter;
  isFilteredActive: boolean;
  setIsFilteredActive: (v: boolean) => void;
  setFilterOnChange: (filter: Filter) => void;
  resetFilter: () => void;
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filter: {dateStart: null, dateEnd: Date.now()},
  isFilteredActive: false,
  setIsFilteredActive: (v: boolean) => set({ isFilteredActive: v }),
  setFilterOnChange: (filter) => set({ filter : filter }),
  resetFilter: () => set({ filter: {dateStart: null, dateEnd: Date.now()} }),
}));

export default useFilterStore;