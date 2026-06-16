import { Input } from "@codegouvfr/react-dsfr/Input";
import { useFilterStore } from "../../../../hooks/store/useFilterStore"
import { use, useEffect, useState } from "react";
import { useDalleStore } from "../../../../hooks/store/useDalleStore";

const FilterDate = () => {

  const filter = useFilterStore((state) => state.filter);
  const selectedProduits = useDalleStore((state) => state.selectedProduits);
  const filteredProduits = useDalleStore((state) => state.filteredProduits);
  const setFilterOnChange = useFilterStore((state) => state.setFilterOnChange);
  const addHistoricStep = useDalleStore((state) => state.addHistoricStep);
  const [dateStart, setDateStart] = useState(filter.dateStart);
  const [dateEnd, setDateEnd] = useState(filter.dateEnd);
  

  return (
    <div className="filter-date">
      <Input
        nativeInputProps={{
          type: 'date',

          onChange: (e) => {
            addHistoricStep([{
              action: "filter",
              filter: useFilterStore.getState().filter,
            }]);
            setDateStart(new Date(e.target.value).getTime());
            filteredProduits({ dateStart: new Date(e.target.value).getTime(), dateEnd: dateEnd });
            setFilterOnChange({ dateStart: new Date(e.target.value).getTime(), dateEnd: dateEnd });
            
          },
          value: useFilterStore.getState().filter.dateStart ? new Date(useFilterStore.getState().filter.dateStart).toISOString().slice(0, 10) : ''
        }}
        label="Date de début"
      />


      <Input
        nativeInputProps={{
          type: 'date',
          onChange: (e) => {
            addHistoricStep([{
              action: "filter",
              filter: useFilterStore.getState().filter,
            }]);
            setDateEnd(new Date(e.target.value).getTime());
            filteredProduits({ dateStart: dateStart, dateEnd: new Date(e.target.value).getTime() });
            setFilterOnChange({ dateStart: dateStart, dateEnd: new Date(e.target.value).getTime() });
            
          },
          value: useFilterStore.getState().filter.dateEnd ? new Date(useFilterStore.getState().filter.dateEnd).toISOString().slice(0, 10) : ''
        }}
        label="Date de fin" />
    </div>
  );
};

export default FilterDate;

