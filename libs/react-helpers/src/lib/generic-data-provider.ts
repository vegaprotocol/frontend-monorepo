import type {
  ApolloClient,
  DocumentNode,
  FetchPolicy,
  TypedDocumentNode,
  OperationVariables,
} from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import isEqual from 'lodash/isEqual';
import type { Pagination as PaginationWithoutSkip } from '@vegaprotocol/types';

export interface UpdateCallback<Data, Delta> {
  (arg: {
    data: Data | null;
    error?: Error;
    loading: boolean;
    loaded: boolean;
    pageInfo: PageInfo | null;
    delta?: Delta;
    insertionData?: Data | null;
    totalCount?: number;
  }): void;
}

export interface Load<Data> {
  (start?: number, end?: number): Promise<Data | null>;
}

type Pagination = PaginationWithoutSkip & {
  skip?: number;
};

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
export interface Subscribe<Data, Delta> {
  (
    callback: UpdateCallback<Data, Delta>,
    client: ApolloClient<object>,
    variables?: OperationVariables
  ): {
    unsubscribe: () => void;
    reload: (forceReset?: boolean) => void;
    flush: () => void;
    load?: Load<Data>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Query<Result> = DocumentNode | TypedDocumentNode<Result, any>;

export interface Update<Data, Delta> {
  (data: Data, delta: Delta, reload: (forceReset?: boolean) => void): Data;
}

export interface Append<Data> {
  (
    data: Data | null,
    insertionData: Data | null,
    insertionPageInfo: PageInfo | null,
    pagination?: Pagination,
    totalCount?: number
  ): {
    data: Data | null;
    totalCount?: number;
  };
}

interface GetData<QueryData, Data> {
  (queryData: QueryData): Data | null;
}

interface GetPageInfo<QueryData> {
  (queryData: QueryData): PageInfo | null;
}

interface GetTotalCount<QueryData> {
  (queryData: QueryData): number | undefined;
}

interface GetDelta<SubscriptionData, Delta> {
  (subscriptionData: SubscriptionData): Delta;
}

export function defaultAppend<Data>(
  data: Data | null,
  insertionData: Data | null,
  insertionPageInfo: PageInfo | null,
  pagination?: Pagination,
  totalCount?: number
) {
  if (data && insertionData && insertionPageInfo) {
    if (!(data instanceof Array) || !(insertionData instanceof Array)) {
      throw new Error(
        'data needs to be instance of { cursor: string }[] when using pagination'
      );
    }
    if (pagination?.after) {
      const cursors = data.map((item) => item && item.cursor);
      const startIndex = cursors.lastIndexOf(pagination.after);
      if (startIndex !== -1) {
        const start = startIndex + 1 + (pagination.skip ?? 0);
        const end = start + insertionData.length;
        let updatedData = [
          ...data.slice(0, start),
          ...insertionData,
          ...data.slice(end),
        ];
        if (!insertionPageInfo.hasNextPage && end !== (totalCount ?? 0)) {
          // adjust totalCount if last page is shorter or longer than expected
          totalCount = end;
          updatedData = updatedData.slice(0, end);
        }
        return {
          data: updatedData,
          // increase totalCount if last page is longer than expected
          totalCount: totalCount && Math.max(updatedData.length, totalCount),
        };
      }
    }
  }
  return { data, totalCount };
}

interface DataProviderParams<QueryData, Data, SubscriptionData, Delta> {
  query: Query<QueryData>;
  subscriptionQuery: Query<SubscriptionData>;
  update: Update<Data, Delta>;
  getData: GetData<QueryData, Data>;
  getDelta: GetDelta<SubscriptionData, Delta>;
  pagination?: {
    getPageInfo: GetPageInfo<QueryData>;
    getTotalCount?: GetTotalCount<QueryData>;
    append: Append<Data>;
    first: number;
  };
  fetchPolicy?: FetchPolicy;
}

/**
 * @param subscriptionQuery query that will be used for subscription
 * @param update function that will be executed on each onNext, it should update data base on delta, it can reload data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param fetchPolicy
 * @returns subscribe function
 */
function makeDataProviderInternal<QueryData, Data, SubscriptionData, Delta>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
  pagination,
  fetchPolicy,
}: DataProviderParams<QueryData, Data, SubscriptionData, Delta>): Subscribe<
  Data,
  Delta
> {
  // list of callbacks passed through subscribe call
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  // subscription is started before initial query, all deltas that will arrive before initial query response are put on queue
  const updateQueue: Delta[] = [];

  let variables: OperationVariables | undefined;
  let data: Data | null = null;
  let error: Error | undefined;
  let loading = true;
  let loaded = false;
  let client: ApolloClient<object>;
  let subscription: Subscription | undefined;
  let pageInfo: PageInfo | null = null;
  let totalCount: number | undefined;

  // notify single callback about current state, delta is passes optionally only if notify was invoked onNext
  const notify = (
    callback: UpdateCallback<Data, Delta>,
    updateData?: { delta?: Delta; insertionData?: Data | null }
  ) => {
    callback({
      data,
      error,
      loading,
      loaded,
      pageInfo,
      totalCount,
      ...updateData,
    });
  };

  // notify all callbacks
  const notifyAll = (updateData?: {
    delta?: Delta;
    insertionData?: Data | null;
  }) => {
    callbacks.forEach((callback) => notify(callback, updateData));
  };

  const load = async (start?: number, end?: number) => {
    if (!pagination || !pageInfo || !(data instanceof Array)) {
      return Promise.reject();
    }
    const paginationVariables: Pagination = {
      first: pagination.first,
      after: pageInfo.endCursor,
    };
    if (start !== undefined) {
      if (!start) {
        paginationVariables.after = undefined;
      } else if (data && data[start - 1]) {
        paginationVariables.after = (
          data[start - 1] as { cursor: string }
        ).cursor;
      } else {
        let skip = 1;
        while (!data[start - 1 - skip] && skip <= start) {
          skip += 1;
        }
        paginationVariables.skip = skip;
        if (skip === start) {
          paginationVariables.after = undefined;
        } else {
          paginationVariables.after = (
            data[start - 1 - skip] as { cursor: string }
          ).cursor;
        }
      }
    } else if (!pageInfo.hasNextPage) {
      return null;
    }
    const res = await client.query<QueryData>({
      query,
      variables: {
        ...variables,
        pagination: paginationVariables,
      },
      fetchPolicy: fetchPolicy || 'no-cache',
    });
    const insertionData = getData(res.data);
    const insertionPageInfo = pagination.getPageInfo(res.data);
    ({ data, totalCount } = pagination.append(
      data,
      insertionData,
      insertionPageInfo,
      paginationVariables,
      totalCount
    ));
    pageInfo = insertionPageInfo;
    totalCount =
      (pagination.getTotalCount && pagination.getTotalCount(res.data)) ??
      totalCount;
    notifyAll({ insertionData });
    return insertionData;
  };

  const initialFetch = async () => {
    if (!client) {
      return;
    }
    try {
      const res = await client.query<QueryData>({
        query,
        variables: pagination
          ? { ...variables, pagination: { first: pagination.first } }
          : variables,
        fetchPolicy,
      });
      data = getData(res.data);
      if (data && pagination) {
        if (!(data instanceof Array)) {
          throw new Error(
            'data needs to be instance of { cursor: string }[] when using pagination'
          );
        }
        pageInfo = pagination.getPageInfo(res.data);
        if (pageInfo && !pageInfo.hasNextPage) {
          totalCount = data.length;
        } else {
          totalCount =
            pagination.getTotalCount && pagination.getTotalCount(res.data);
        }

        if (data && totalCount && data.length < totalCount) {
          data.push(...new Array(totalCount - data.length).fill(null));
        }
      }
      // if there was some updates received from subscription during initial query loading apply them on just received data
      if (data && updateQueue && updateQueue.length > 0) {
        while (updateQueue.length) {
          const delta = updateQueue.shift();
          if (delta) {
            data = update(data, delta, reload);
          }
        }
      }
      loaded = true;
    } catch (e) {
      // if error will occur data provider stops subscription
      error = e as Error;
      if (subscription) {
        subscription.unsubscribe();
      }
      subscription = undefined;
    } finally {
      loading = false;
      notifyAll();
    }
  };

  // reload function is passed to update and as a returned by subscribe function
  const reload = (forceReset = false) => {
    if (loading) {
      return;
    }
    // hard reset on demand or when there is no apollo subscription yet
    if (forceReset || !subscription) {
      reset();
      initialize();
    } else {
      loading = true;
      error = undefined;
      initialFetch();
    }
  };

  const initialize = async () => {
    if (subscription) {
      return;
    }
    loading = true;
    error = undefined;
    notifyAll();
    if (!client) {
      return;
    }
    subscription = client
      .subscribe<SubscriptionData>({
        query: subscriptionQuery,
        variables,
        fetchPolicy,
      })
      .subscribe(
        ({ data: subscriptionData }) => {
          if (!subscriptionData) {
            return;
          }
          const delta = getDelta(subscriptionData);
          if (loading || !data) {
            updateQueue.push(delta);
          } else {
            const updatedData = update(data, delta, reload);
            if (updatedData === data) {
              return;
            }
            data = updatedData;
            notifyAll({ delta });
          }
        },
        () => reload()
      );
    await initialFetch();
  };

  const reset = () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = undefined;
    }
    data = null;
    error = undefined;
    loading = false;
    loaded = false;
    notifyAll();
  };

  // remove callback from list, and unsubscribe if there is no more callbacks registered
  const unsubscribe = (callback: UpdateCallback<Data, Delta>) => {
    callbacks.splice(callbacks.indexOf(callback), 1);
    if (callbacks.length === 0) {
      reset();
    }
  };

  return (callback, c, v) => {
    callbacks.push(callback);
    if (callbacks.length === 1) {
      client = c;
      variables = v;
      initialize();
    } else {
      notify(callback);
    }
    return {
      unsubscribe: () => unsubscribe(callback),
      reload,
      flush: () => notify(callback),
      load,
    };
  };
}

/**
 * Memoizes data provider instances using query variables as cache key
 *
 * @param fn
 * @returns subscibe function
 */
const memoize = <Data, Delta>(
  fn: (variables?: OperationVariables) => Subscribe<Data, Delta>
) => {
  const cache: {
    subscribe: Subscribe<Data, Delta>;
    variables?: OperationVariables;
  }[] = [];
  return (variables?: OperationVariables) => {
    const cached = cache.find((c) => isEqual(c.variables, variables));
    if (cached) {
      return cached.subscribe;
    }
    const subscribe = fn(variables);
    cache.push({ subscribe, variables });
    return subscribe;
  };
};

/**
 * @param query Query<QueryData>
 * @param subscriptionQuery Query<SubscriptionData> query that will be used for subscription
 * @param update Update<Data, Delta> function that will be executed on each onNext, it should update data base on delta, it can reload data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param pagination pagination related functions { getPageInfo, getTotalCount, append, first }
 * @returns Subscribe<Data, Delta> subscribe function
 * @example
 * const marketMidPriceProvider = makeDataProvider<QueryData, Data, SubscriptionData, Delta>({
 *   query: gql`query MarketMidPrice($marketId: ID!) { market(id: $marketId) { data { midPrice } } }`,
 *   subscriptionQuery: gql`subscription MarketMidPriceSubscription($marketId: ID!) { marketDepthUpdate(marketId: $marketId) { market { data { midPrice } } } }`,
 *   update: (draft: Draft<Data>, delta: Delta, reload: (forceReset?: boolean) => void) => { draft.midPrice = delta.midPrice }
 *   getData: (data:QueryData) => data.market.data.midPrice
 *   getDelta: (delta:SubscriptionData) => delta.marketData.market
 *  })
 *
 * const { unsubscribe, flush, reload } = marketMidPriceProvider(
 *   ({ data, error, loading, delta }) => { ... },
 *   apolloClient,
 *   { id: '1fd726454fa1220038acbf6ff9ac701d8b8bf3f2d77c93a4998544471dc58747' }
 * )
 *
 */
export function makeDataProvider<QueryData, Data, SubscriptionData, Delta>(
  params: DataProviderParams<QueryData, Data, SubscriptionData, Delta>
): Subscribe<Data, Delta> {
  const getInstance = memoize<Data, Delta>(() =>
    makeDataProviderInternal(params)
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}

/**
 * Dependency subscribe needs to use any as Data and Delta because it's unknown what dependencies will be used.
 * This effects in parts in combine function has any[] type
 */
type DependencySubscribe = Subscribe<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type DependencyUpdateCallback = Parameters<DependencySubscribe>['0'];
export type CombineDerivedData<Data> = (
  parts: Parameters<DependencyUpdateCallback>['0']['data'][]
) => Data | null;

function makeDerivedDataProviderInternal<Data>(
  dependencies: DependencySubscribe[],
  combineData: CombineDerivedData<Data>
): Subscribe<Data, never> {
  let subscriptions: ReturnType<DependencySubscribe>[] | undefined;
  let client: ApolloClient<object>;
  const callbacks: UpdateCallback<Data, never>[] = [];
  let variables: OperationVariables | undefined;
  const parts: Parameters<DependencyUpdateCallback>['0'][] = [];
  let data: Data | null = null;
  let error: Error | undefined;
  let loading = true;
  let loaded = false;

  // notify single callback about current state, delta is passes optionally only if notify was invoked onNext
  const notify = (callback: UpdateCallback<Data, never>) => {
    callback({
      data,
      error,
      loading,
      loaded,
      pageInfo: null,
    });
  };

  // notify all callbacks
  const notifyAll = () =>
    callbacks.forEach((callback) => {
      notify(callback);
    });

  const combine = () => {
    let newError: Error | undefined;
    let newLoading = false;
    let newLoaded = true;
    dependencies
      .map((dependency, i) => parts[i])
      .forEach((part) => {
        newError = newError || (part && part.error);
        newLoading = newLoading || !part || part.loading;
        newLoaded = newLoaded && part && part.loaded;
      });

    const newData = newLoaded
      ? combineData(parts.map((part) => part.data))
      : data;
    if (
      newLoading !== loading ||
      newError !== error ||
      newLoaded !== loaded ||
      newData !== data
    ) {
      data = newData;
      loading = newLoading;
      error = newError;
      loaded = newLoaded;
      notifyAll();
    }
  };

  const initialize = () => {
    if (subscriptions) {
      return;
    }
    subscriptions = dependencies.map((dependency, i) =>
      dependency(
        (updateData) => {
          parts[i] = updateData;
          combine();
        },
        client,
        variables
      )
    );
  };

  // remove callback from list, and unsubscribe if there is no more callbacks registered
  const unsubscribe = (callback: UpdateCallback<Data, never>) => {
    callbacks.splice(callbacks.indexOf(callback), 1);
    if (callbacks.length === 0) {
      subscriptions?.forEach((subscription) => subscription.unsubscribe());
      subscriptions = undefined;
      data = null;
      error = undefined;
      loading = true;
      loaded = false;
    }
  };

  return (callback, c, v) => {
    callbacks.push(callback);
    if (callbacks.length === 1) {
      client = c;
      variables = v;
      initialize();
    } else {
      notify(callback);
    }
    return {
      unsubscribe: () => unsubscribe(callback),
      reload: (forceReset) =>
        subscriptions &&
        subscriptions.forEach((subscription) =>
          subscription.reload(forceReset)
        ),
      flush: () => notify(callback),
    };
  };
}

// Derived data provider has no subscription, hence there is no delta (never)
export function makeDerivedDataProvider<Data>(
  dependencies: DependencySubscribe[],
  combineData: CombineDerivedData<Data>
): Subscribe<Data, never> {
  const getInstance = memoize<Data, never>(() =>
    makeDerivedDataProviderInternal(dependencies, combineData)
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}
