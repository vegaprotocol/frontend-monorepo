import { useState, useEffect, useRef, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import type { Subscribe } from '../lib/generic-data-provider';

export function useDataProvider<Data, Delta>(
  dataProvider: Subscribe<Data, Delta>,
  update?: (delta: Delta) => boolean,
  variables?: OperationVariables
) {
  const client = useApolloClient();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const flushRef = useRef<(() => void) | undefined>(undefined);
  const restartRef = useRef<(() => void) | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  const flush = useCallback(() => {
    if (flushRef.current) {
      flushRef.current();
    }
  }, []);
  const restart = useCallback(() => {
    if (restartRef.current) {
      restartRef.current();
    }
  }, []);
  const callback = useCallback(
    ({ data, error, loading, delta }) => {
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        if (!initialized.current || !delta || !update || !update(delta)) {
          initialized.current = true;
          setData(data);
        }
      }
    },
    [update]
  );
  useEffect(() => {
    const { unsubscribe, flush, restart } = dataProvider(
      callback,
      client,
      variables
    );
    flushRef.current = flush;
    restartRef.current = restart;
    return unsubscribe;
  }, [client, initialized, dataProvider, callback, variables]);
  return { data, loading, error, flush, restart };
}
