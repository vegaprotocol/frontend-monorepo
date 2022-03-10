import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import debounce from 'lodash.debounce';
import { Guess, GuessVariables } from './__generated__/Guess';

const TX_LENGTH = 64;

enum PossibleIdTypes {
  Block = 'Block',
  Tx = 'Tx',
  Party = 'Party',
  Market = 'Market',
  Unknown = 'Unknown',
}

const GUESS_QUERY = gql`
  query Guess($guess: ID!) {
    party(id: $guess) {
      id
    }
    market(id: $guess) {
      id
    }
  }
`;

const usePossibleType = (search: string) => {
  const [possibleType, setPossibleType] = useState<PossibleIdTypes>();
  const { data, loading, error } = useQuery<Guess, GuessVariables>(
    GUESS_QUERY,
    {
      variables: {
        guess: search,
      },
      skip: !search,
    }
  );

  React.useEffect(() => {
    if (!isNaN(Number(search))) {
      setPossibleType(PossibleIdTypes.Block);
    } else if (data?.party) {
      setPossibleType(PossibleIdTypes.Party);
    } else if (data?.market) {
      setPossibleType(PossibleIdTypes.Market);
    } else if (search.replace('0x', '').length === TX_LENGTH) {
      setPossibleType(PossibleIdTypes.Tx);
    } else {
      setPossibleType(PossibleIdTypes.Unknown);
    }
  }, [data?.market, data?.party, search, setPossibleType]);

  return {
    loading,
    error,
    possibleType,
  };
};

const useGuess = () => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const { loading, error, possibleType } = usePossibleType(debouncedSearch);
  const debouncedSearchSet = React.useMemo(
    () => debounce(setDebouncedSearch, 1000),
    [setDebouncedSearch]
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      setSearch(search);
      debouncedSearchSet(search);
    },
    [debouncedSearchSet]
  );

  return {
    onChange,
    search,
    loading,
    error,
    possibleType,
  };
};

const Search = () => {
  const { search, onChange } = useGuess();
  return (
    <section>
      <h1 data-testid="explorer-header">Vega Block Explorer</h1>
      <fieldset>
        <label htmlFor="search">Search: </label>
        <input
          data-testid="search-field"
          name="search"
          value={search}
          onChange={(e) => onChange(e)}
        />
      </fieldset>
    </section>
  );
};

export default Search;
