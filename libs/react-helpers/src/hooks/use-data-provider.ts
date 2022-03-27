import { useState, useEffect, useRef, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import type { Subscribe } from '@vegaprotocol/graphql';

export function useDataProvider<Data, Delta>(
  dataProvider: Subscribe<Data, Delta>,
  update: (delta: Delta) => boolean = () => false,
  variables?: OperationVariables
) {
  const client = useApolloClient();
  const [data, setData] = useState<Data[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  const callback = useCallback(
    ({ data, error, loading, delta }) => {
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        if (!initialized.current || !delta || !update(delta)) {
          initialized.current = true;
          setData(data);
        }
      }
    },
    [update]
  );
  useEffect(() => {
    return dataProvider(callback, client, variables);
  }, [client, initialized, dataProvider, callback, variables]);
  return { data, loading, error };
}
