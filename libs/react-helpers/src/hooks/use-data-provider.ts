import { useState, useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import type { ApolloClient } from '@apollo/client';

export function useDataProvider<Data, Delta>(
  dataProvider: (
    client: ApolloClient<object>,
    callback: (arg: {
      data: Data[] | null;
      error?: Error;
      loading: boolean;
      delta?: Delta;
    }) => void
  ) => () => void,
  update: (delta: Delta) => boolean = () => false
) {
  const client = useApolloClient();
  const [data, setData] = useState<Data[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  useEffect(() => {
    return dataProvider(client, ({ data, error, loading, delta }) => {
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        if (!initialized.current || !delta || !update(delta)) {
          initialized.current = true;
          setData(data);
        }
      }
    });
  }, [client, initialized, dataProvider, update]);
  return { data, loading, error };
}
