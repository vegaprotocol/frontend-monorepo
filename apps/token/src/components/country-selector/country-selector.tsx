import { MenuItem } from "@blueprintjs/core";
import { ItemPredicate, Suggest } from "@blueprintjs/select";

import { ICountry } from "../../routes/claim/claim-form";
import countryData from "./country-data";

const CountrySuggest = Suggest.ofType<ICountry>();

export const filterCountry: ItemPredicate<ICountry> = (
  query,
  country,
  _index,
  exactMatch
) => {
  const normalizedTitle = country.name.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else if (query.length === 2) {
    return normalizedQuery === country.code.toLowerCase();
  } else {
    return normalizedTitle.indexOf(normalizedQuery) >= 0;
  }
};

export interface CountrySelectorProps {
  onSelectCountry: (countryCode: string) => void;
  code: string | null;
}

export const CountrySelector = ({
  onSelectCountry,
  code,
}: CountrySelectorProps) => {
  return (
    <div data-testid="country-selector">
      <CountrySuggest
        selectedItem={
          countryData.find((c) => c.code === code) || countryData[0]
        }
        items={countryData}
        itemRenderer={(item, { handleClick, modifiers }) => (
          <MenuItem
            data-testid={item.code}
            key={item.code}
            text={item.name}
            active={modifiers.active}
            disabled={modifiers.disabled}
            onClick={handleClick}
          />
        )}
        onItemSelect={(item) => {
          onSelectCountry(item.code);
        }}
        inputValueRenderer={(item) => item.name}
        popoverProps={{ minimal: true }}
        noResults={<MenuItem disabled={true} text="No results." />}
        itemPredicate={filterCountry}
        fill={true}
      />
    </div>
  );
};
