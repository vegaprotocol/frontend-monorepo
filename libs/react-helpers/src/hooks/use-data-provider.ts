import { useState, useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';
import { useApolloClient } from '@apollo/client';
import { usePrevious } from './use-previous';
import type { OperationVariables } from '@apollo/client';
import type { Subscribe, Load, UpdateCallback } from '@vegaprotocol/utils';

export interface useDataProviderParams<
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
> {
  dataProvider: Subscribe<Data, Delta, Variables>;
  update?: ({
    delta,
    data,
    totalCount,
  }: {
    delta?: Delta;
    data: Data | null;
    totalCount?: number;
  }) => boolean;
  insert?: ({
    insertionData,
    data,
    totalCount,
  }: {
    insertionData?: Data | null;
    data: Data | null;
    totalCount?: number;
  }) => boolean;
  variables: Variables;
  skipUpdates?: boolean;
  skip?: boolean;
}

/**
 *
 * @param dataProvider subscribe function created by makeDataProvider
 * @param update optional function called on each delta received in subscription, if returns true updated data will be not passed from hook (component handles updates internally)
 * @param variables optional
 * @returns state: data, loading, error, methods: flush (pass updated data to update function without delta), restart: () => void}};
 */
export const useDataProvider = <
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
>({
  dataProvider,
  update,
  insert,
  skipUpdates,
  skip,
  ...props
}: useDataProviderParams<Data, Delta, Variables>) => {
  const client = useApolloClient();
  const [data, setData] = useState<Data | null>(null);
  const [totalCount, setTotalCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<Error | undefined>(undefined);
  const flushRef = useRef<(() => void) | undefined>(undefined);
  const reloadRef = useRef<((force?: boolean) => void) | undefined>(undefined);
  const loadRef = useRef<Load<Data> | undefined>(undefined);
  const prevVariables = usePrevious(props.variables);
  const [variables, setVariables] = useState(props.variables);
  useEffect(() => {
    if (!isEqual(prevVariables, props.variables)) {
      setVariables(props.variables);
    }
  }, [props.variables, prevVariables]);
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
    (args) => {
      const {
        data,
        delta,
        error,
        loading,
        insertionData,
        totalCount,
        isInsert,
        isUpdate,
      } = args;
      setError(error);
      setLoading(loading);
      // if update or insert function returns true it means that component handles updates
      // component can use flush() which will call callback without delta and cause data state update
      if (!loading) {
        if (
          isUpdate &&
          !skipUpdates &&
          update &&
          update({ delta, data, totalCount })
        ) {
          return;
        }
        if (isInsert && insert && insert({ insertionData, data, totalCount })) {
          return;
        }
      }
      setTotalCount(totalCount);
      setData(data);
      if (!loading && !isUpdate && update) {
        update({ data });
      }
    },
    [update, insert, skipUpdates]
  );
  useEffect(() => {
    setData(null);
    setError(undefined);
    setTotalCount(undefined);
    if (update) {
      update({ data: null });
    }
    if (skip) {
      setLoading(false);
      if (update) {
        update({ data: null });
      }
      return;
    }
    setLoading(true);
    const { unsubscribe, flush, reload, load } = dataProvider(
      callback,
      client,
      variables
    );
    flushRef.current = flush;
    reloadRef.current = reload;
    loadRef.current = load;
    return () => {
      flushRef.current = undefined;
      reloadRef.current = undefined;
      loadRef.current = undefined;
      return unsubscribe();
    };
  }, [client, dataProvider, callback, variables, skip, update]);
  return {
    data,
    loading,
    error,
    flush,
    reload,
    load,
    totalCount,
  };
};

export const useThrottledDataProvider = <
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
>(
  params: Omit<useDataProviderParams<Data, Delta, Variables>, 'update'>,
  wait = 500
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
    return () => {
      throttledUpdate.cancel();
    };
  }, []);

  useEffect(() => {
    setData(returnValues.data);
  }, [returnValues.data]);

  return { ...returnValues, data };
};
