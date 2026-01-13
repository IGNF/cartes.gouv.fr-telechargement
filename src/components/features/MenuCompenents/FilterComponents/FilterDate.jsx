import { Input } from "@codegouvfr/react-dsfr/Input";
import { useFilterStore } from "../../../../hooks/store/useFilterStore"
import { use, useEffect, useState } from "react";
import { useDalleStore } from "../../../../hooks/store/useDalleStore";

const FilterDate = () => {

  const filter = useFilterStore((state) => state.filter);
  const selectedDalles = useDalleStore((state) => state.selectedDalles);
  const filteredProduits = useDalleStore((state) => state.filteredProduits);
  const setFilterOnChange = useFilterStore((state) => state.setFilterOnChange);
  const [dateStart, setDateStart] = useState(filter.dateStart);
  const [dateEnd, setDateEnd] = useState(filter.dateEnd);

  useEffect(() => {
    filteredProduits({ dateStart, dateEnd });
    setDateStart(filter.dateStart);
    setDateEnd(filter.dateEnd);
  }, [selectedDalles, filter]);

  return (
    <div className="filter-date">
      <Input
        nativeInputProps={{
          type: 'date',

          onChange: (e) => {
            setDateStart(new Date(e.target.value).getTime());
            filteredProduits({ dateStart: new Date(e.target.value).getTime(), dateEnd: dateEnd });
            setFilterOnChange({ dateStart: new Date(e.target.value).getTime(), dateEnd: dateEnd });
          },
          defaultValue: dateStart
        }}
        label="Date de début" />

      <Input
        nativeInputProps={{
          type: 'date',
          onChange: (e) => {
            setDateEnd(new Date(e.target.value).getTime());
            filteredProduits({ dateStart: dateStart, dateEnd: new Date(e.target.value).getTime() });
            setFilterOnChange({ dateStart: dateStart, dateEnd: new Date(e.target.value).getTime() });
          },
          defaultValue: dateEnd
        }}
        label="Date de fin" />
    </div>
  );
};

export default FilterDate;

