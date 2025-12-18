import { log } from "console";
import { create } from "zustand";

type Filter = { dateStart: number; dateEnd: number };


type FilterStore = {
  filter: Filter;
  isFilteredActive: boolean;
  setIsFilteredActive: (v: boolean) => void;
  setFilterOnChange: (filter: Filter) => void;
  resetFilter: () => void;
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filter: {dateStart: new Date("1000-01-01").getTime(), dateEnd: Date.now()},
  isFilteredActive: false,
  setIsFilteredActive: (v: boolean) => set({ isFilteredActive: v }),
  setFilterOnChange: (filter) => set({ filter : filter }),
  resetFilter: () => set({ filter: {dateStart: new Date("1000-01-01").getTime(), dateEnd: Date.now()} }),
}));

export default useFilterStore;