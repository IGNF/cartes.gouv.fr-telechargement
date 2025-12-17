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
  }, [selectedDalles]);

  return (
    <div className="filter-date">
      <Input
        nativeInputProps={{
          type: 'date',

          onChange: (e) => {
            setDateStart(e.target.value);
            filteredProduits({ dateStart: e.target.value, dateEnd: dateEnd });
            setFilterOnChange({ dateStart: e.target.value, dateEnd: dateEnd });
          },
          defaultValue: dateStart
        }}
        label="Date de début" />

      <Input
        nativeInputProps={{
          type: 'date',
          onChange: (e) => {
            setDateEnd(e.target.value);
            filteredProduits({ dateStart: dateStart, dateEnd: e.target.value });
            setFilterOnChange({ dateStart: dateStart, dateEnd: e.target.value });
          },
          defaultValue: dateEnd
        }}
        label="Date de fin" />
    </div>
  );
};

export default FilterDate;

