import { useState, useEffect, useRef, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import type {
  Subscribe,
  Load,
  UpdateCallback,
} from '../lib/generic-data-provider';

/**
 *
 * @param dataProvider subscribe function created by makeDataProvider
 * @param update optional function called on each delta received in subscription, if returns true updated data will be not passed from hook (component handles updates internally)
 * @param variables optional
 * @returns state: data, loading, error, methods: flush (pass updated data to update function without delta), restart: () => void}};
 */
export function useDataProvider<Data, Delta>({
  dataProvider,
  update,
  insert,
  variables,
}: {
  dataProvider: Subscribe<Data, Delta>;
  update?: ({ delta, data }: { delta: Delta; data: Data }) => boolean;
  insert?: ({
    insertionData,
    data,
    totalCount,
  }: {
    insertionData: Data;
    data: Data;
    totalCount?: number;
  }) => boolean;
  variables?: OperationVariables;
}) {
  const client = useApolloClient();
  const [data, setData] = useState<Data | null>(null);
  const [totalCount, setTotalCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const flushRef = useRef<(() => void) | undefined>(undefined);
  const reloadRef = useRef<((force?: boolean) => void) | undefined>(undefined);
  const loadRef = useRef<Load<Data> | undefined>(undefined);
  const initialized = useRef<boolean>(false);
  const flush = useCallback(() => {
    if (flushRef.current) {
      flushRef.current();
    }
  }, []);
  const reload = useCallback((force = false) => {
    if (reloadRef.current) {
      reloadRef.current(force);
    }
  }, []);
  const load = useCallback<Load<Data>>((...args) => {
    if (loadRef.current) {
      return loadRef.current(...args);
    }
    return Promise.reject();
  }, []);
  const callback = useCallback<UpdateCallback<Data, Delta>>(
    ({ data, error, loading, delta, insertionData, totalCount }) => {
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        // if update or insert function returns true it means that component handles updates
        // component can use flush() which will call callback without delta and cause data state update
        if (initialized.current && data) {
          if (delta && update && update({ delta, data })) {
            return;
          }
          if (
            insertionData &&
            insert &&
            insert({ insertionData, data, totalCount })
          ) {
            return;
          }
        }
        initialized.current = true;
        setTotalCount(totalCount);
        setData(data);
      }
    },
    [update, insert]
  );
  useEffect(() => {
    const { unsubscribe, flush, reload, load } = dataProvider(
      callback,
      client,
      variables
    );
    flushRef.current = flush;
    reloadRef.current = reload;
    loadRef.current = load;
    return unsubscribe;
  }, [client, initialized, dataProvider, callback, variables]);
  return { data, loading, error, flush, reload, load, totalCount };
}
