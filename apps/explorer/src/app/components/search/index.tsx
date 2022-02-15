import React from "react";
import { useState } from "react";

const PARTY_ID_LENGTH = 64;

enum PossibleIdTypes {
  Block = "Block",
  Tx = "Tx",
  Party = "Party",
  Unknown = "Unknown",
}

const useGuess = () => {
  const [search, setSearch] = useState<string>("");
  const [possibleTypes, setPossibleTypes] = useState<PossibleIdTypes[]>();

  const getPossibleIds = React.useCallback((search: string) => {
    if (!search.length) {
      return [];
    } else if (
      search.startsWith("0x") &&
      search.length === PARTY_ID_LENGTH + 2
    ) {
      return [PossibleIdTypes.Tx, PossibleIdTypes.Party];
    } else if (!search.startsWith("0x") && search.length === PARTY_ID_LENGTH) {
      return [PossibleIdTypes.Tx, PossibleIdTypes.Party];
    } else if (!isNaN(Number(search))) {
      return [PossibleIdTypes.Block];
    }
    return [];
  }, []);

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      setSearch(search);
      setPossibleTypes(getPossibleIds(search));
    },
    [getPossibleIds]
  );

  return {
    onChange,
    possibleTypes,
    search,
  };
};

const Search = () => {
  const { search, onChange, possibleTypes } = useGuess();
  return (
    <section>
      <h1>Vega Block Explorer</h1>
      <fieldset>
        <label htmlFor="search">Search: </label>
        <input
          name="search"
          value={search}
          onChange={(e) => onChange(e)}
        ></input>
      </fieldset>
      {/* TODO implement links */}
      <div>{JSON.stringify(possibleTypes)}</div>
    </section>
  );
};

export default Search;
