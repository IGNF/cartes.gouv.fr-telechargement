import { log } from "console";
import { create } from "zustand";

type Filter = { dateStart: number; dateEnd: number };


type FilterStore = {
  filter: Filter;
  isFilteredActive: boolean;
  setIsFilteredActive: (v: boolean) => void;
  setFilter: (filter: Filter) => void;
  setFilterOnChange: (filter: Filter) => void;
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filter: {dateStart: new Date("1000-01-01").getTime(), dateEnd: Date.now()},
  isFilteredActive: false,
  setIsFilteredActive: (v: boolean) => set({ isFilteredActive: v }),
  setFilter: (filter) => {
    console.log("setFilter", filter);
    if (filter.dateStart !== null && filter.dateEnd !== null) {
      set({ isFilteredActive: false });
    }
    // on verifie si les bornes pour filtrer ont bougé
    if (filter.dateStart > get().filter.dateStart ) {
        filter.dateStart = get().filter.dateStart;
    }
    if (filter.dateEnd < get().filter.dateEnd ) {
        filter.dateEnd = get().filter.dateEnd;
    }
    set({ filter });
  },
  setFilterOnChange: (filter) => set({ filter : filter }),
}));

export default useFilterStore;