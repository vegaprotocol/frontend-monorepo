import { useState, useEffect, useRef, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import type { Subscribe } from '../lib/generic-data-provider';

/**
 *
 * @param dataProvider subscribe function created by makeDataProvider
 * @param update optional function called on each delta received in subscription, if returns true updated data will be not passed from hook (component handles updates internally)
 * @param variables optional
 * @returns state: data, loading, error, methods: flush (pass updated data to update function without delta), restart: () => void}};
 */
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
  const restartRef = useRef<((force?: boolean) => void) | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  const flush = useCallback(() => {
    if (flushRef.current) {
      flushRef.current();
    }
  }, []);
  const restart = useCallback((force = false) => {
    if (restartRef.current) {
      restartRef.current(force);
    }
  }, []);
  const callback = useCallback(
    ({ data, error, loading, delta }) => {
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        // if update function returns true it means that component handles updates
        // component can use flush() which will call callback without delta and cause data state update
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
