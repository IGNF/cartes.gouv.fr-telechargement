import { Range } from "@codegouvfr/react-dsfr/Range";

const FilterDate = () => {
  return (
    <Range
      double
      label="date"
      RangeProps={{ min: "2000-01-01", max: "2024-12-31", step: "1" }}

    />
  );
};

export default FilterDate;

