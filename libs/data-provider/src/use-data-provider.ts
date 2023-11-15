import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import throttle from 'lodash/throttle';
import isEqualWith from 'lodash/isEqualWith';
import { useApolloClient } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import {
  type UpdateCallback,
  type PageInfo,
  type Subscribe,
  type Load,
} from './generic-data-provider';
import { variablesIsEqualCustomizer } from './generic-data-provider';

export interface useDataProviderParams<
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
> {
  dataProvider: Subscribe<Data, Delta, Variables>;
  update?: ({
    delta,
    data,
    pageInfo,
  }: {
    delta?: Delta;
    data: Data | null;
    pageInfo: PageInfo | null;
  }) => boolean;
  insert?: ({
    insertionData,
    data,
    pageInfo,
  }: {
    insertionData?: Data | null;
    data: Data | null;
    pageInfo: PageInfo | null;
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
 * @returns state: data, loading, pageInfo, error, methods: flush (pass updated data to update function without delta), restart: () => void}};
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
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const flushRef = useRef<(() => void) | undefined>(undefined);
  const reloadRef = useRef<((force?: boolean) => void) | undefined>(undefined);
  const loadRef = useRef<Load<Data> | undefined>(undefined);
  const variablesRef = useRef<Variables>(props.variables);
  const updateRef = useRef(update);
  const insertRef = useRef(insert);
  const skipUpdatesRef = useRef(skipUpdates);
  const variables = useMemo(() => {
    if (
      !isEqualWith(
        variablesRef.current,
        props.variables,
        variablesIsEqualCustomizer
      )
    ) {
      variablesRef.current = props.variables;
    }
    return variablesRef.current;
  }, [props.variables]);
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
  const callback = useCallback<UpdateCallback<Data, Delta>>((args) => {
    const {
      data,
      delta,
      error,
      loading,
      insertionData,
      isInsert,
      isUpdate,
      loaded,
      pageInfo,
    } = args;
    setError(error);
    setLoading(!loaded && loading);
    // if update or insert function returns true it means that component handles updates
    // component can use flush() which will call callback without delta and cause data state update
    if (!loading) {
      if (
        isUpdate &&
        (skipUpdatesRef.current ||
          (!skipUpdatesRef.current &&
            updateRef.current &&
            updateRef.current({ delta, data, pageInfo })))
      ) {
        return;
      }
      if (
        isInsert &&
        insertRef.current &&
        insertRef.current({ insertionData, data, pageInfo })
      ) {
        return;
      }
    }
    setData(data);
    setPageInfo(pageInfo);
    if (!loading && !isUpdate && updateRef.current) {
      updateRef.current({ data, pageInfo });
    }
  }, []);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    insertRef.current = insert;
  }, [insert]);

  useEffect(() => {
    skipUpdatesRef.current = skipUpdates;
  }, [skipUpdates]);

  useEffect(() => {
    setData(null);
    setPageInfo(null);
    setError(undefined);
    if (updateRef.current) {
      updateRef.current({ data: null, pageInfo: null });
    }
    if (skip) {
      setLoading(false);
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
  }, [client, dataProvider, callback, variables, skip]);
  return {
    data,
    pageInfo,
    loading,
    error,
    flush,
    reload,
    load,
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
