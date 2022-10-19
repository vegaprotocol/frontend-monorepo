import { useState, useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash/throttle';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import type {
  Subscribe,
  Load,
  UpdateCallback,
  UpdateDelta,
} from '../lib/generic-data-provider';

function hasDelta<T>(
  updateData: UpdateDelta<T>
): updateData is Required<UpdateDelta<T>> {
  return !!updateData.isUpdate;
}

interface useDataProviderParams<Data, Delta> {
  dataProvider: Subscribe<Data, Delta>;
  update?: ({ delta, data }: { delta?: Delta; data: Data }) => boolean;
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
  updateOnInit?: boolean;
  noUpdate?: boolean;
  skip?: boolean;
}

/**
 *
 * @param dataProvider subscribe function created by makeDataProvider
 * @param update optional function called on each delta received in subscription, if returns true updated data will be not passed from hook (component handles updates internally)
 * @param variables optional
 * @returns state: data, loading, error, methods: flush (pass updated data to update function without delta), restart: () => void}};
 */
export const useDataProvider = <Data, Delta>({
  dataProvider,
  update,
  insert,
  variables,
  updateOnInit,
  noUpdate,
  skip,
}: useDataProviderParams<Data, Delta>) => {
  const client = useApolloClient();
  const [data, setData] = useState<Data | null>(null);
  const [totalCount, setTotalCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(!skip);
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
    (arg) => {
      const {
        data,
        error,
        loading,
        insertionData,
        totalCount,
        isInsert,
        isUpdate,
      } = arg;
      setError(error);
      setLoading(loading);
      if (!error && !loading) {
        // if update or insert function returns true it means that component handles updates
        // component can use flush() which will call callback without delta and cause data state update
        if (initialized.current && data) {
          if (
            isUpdate &&
            !noUpdate &&
            update &&
            hasDelta<Delta>(arg) &&
            update({ delta: arg.delta, data })
          ) {
            return;
          }
          if (
            isInsert &&
            insert &&
            (!insertionData || insert({ insertionData, data, totalCount }))
          ) {
            return;
          }
        }
        setTotalCount(totalCount);
        setData(data);
        if (updateOnInit && !initialized.current && update && data) {
          update({ data });
        }
        initialized.current = true;
      }
    },
    [update, insert, noUpdate, updateOnInit]
  );
  useEffect(() => {
    if (skip) {
      return;
    }
    const { unsubscribe, flush, reload, load } = dataProvider(
      callback,
      client,
      variables
    );
    flushRef.current = flush;
    reloadRef.current = reload;
    loadRef.current = load;
    initialized.current = false;
    return unsubscribe;
  }, [client, initialized, dataProvider, callback, variables, skip]);
  return { data, loading, error, flush, reload, load, totalCount };
};

export const useThrottledDataProvider = <Data, Delta>(
  params: Omit<useDataProviderParams<Data, Delta>, 'update'>,
  wait?: number
) => {
  const [data, setData] = useState<Data | null>(null);
  const dataRef = useRef<Data | null>(null);
  const updateData = useRef(
    throttle(() => {
      if (!dataRef.current) {
        return;
      }
      setData(dataRef.current);
    }, wait)
  );

  const update = useCallback(({ data }: { data: Data | null }) => {
    if (!data) {
      return false;
    }
    dataRef.current = data;
    updateData.current();
    return true;
  }, []);

  const returnValues = useDataProvider({ ...params, update });

  useEffect(() => {
    const throttledUpdate = updateData.current;
    if (!returnValues.data) {
      dataRef.current = null;
      setData(dataRef.current);
      return;
    }
    dataRef.current = returnValues.data;
    setData(dataRef.current);
    return () => {
      throttledUpdate.cancel();
    };
  }, [returnValues.data]);

  return { ...returnValues, data };
};
