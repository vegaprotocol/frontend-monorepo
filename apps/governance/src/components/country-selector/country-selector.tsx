import { Select } from '@vegaprotocol/ui-toolkit';

import countryData from './country-data';

export interface CountrySelectorProps {
  onSelectCountry: (countryCode: string) => void;
  code: string | null | undefined;
}

export const CountrySelector = ({
  onSelectCountry,
  code,
}: CountrySelectorProps) => {
  return (
    <div data-testid="country-selector">
      <Select
        value={code ? code : undefined}
        onChange={(e) => onSelectCountry(e.target.value)}
      >
        {countryData.map((country) => {
          return (
            <option value={country.code} key={country.code}>
              {country.name}
            </option>
          );
        })}
      </Select>
    </div>
  );
};
