import { Range } from "@codegouvfr/react-dsfr/Range";

const FilterDate = () => {
  return (
    <Range
      double
      label="date"
      min="2000-01-01"
      max="2024-12-31"
    />
  );
};

export default FilterDate;

