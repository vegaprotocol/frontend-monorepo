import type {
  ApolloClient,
  DocumentNode,
  FetchPolicy,
  TypedDocumentNode,
  OperationVariables,
} from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import isEqual from 'lodash/isEqual';

export interface UpdateCallback<Data, Delta> {
  (arg: {
    data: Data | null;
    error?: Error;
    loading: boolean;
    pageInfo: PageInfo | null;
    delta?: Delta;
    insertionData?: Data | null;
    totalCount?: number;
  }): void;
}

export interface Load<Data> {
  (pagination: Pagination): Promise<Data | null>;
}

export interface Pagination {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

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
    load: Load<Data>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query<Result> = DocumentNode | TypedDocumentNode<Result, any>;

export interface Update<Data, Delta> {
  (data: Data, delta: Delta, reload: (forceReset?: boolean) => void): Data;
}

export interface Append<Data> {
  (
    data: Data | null,
    pageInfo: PageInfo,
    insertionData: Data | null,
    insertionPageInfo: PageInfo | null,
    pagination?: Pagination
  ): {
    data: Data | null;
    pageInfo: PageInfo;
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

/**
 * @param subscriptionQuery query that will be used for subscription
 * @param update function that will be execued on each onNext, it should update data base on delta, it can reload data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param fetchPolicy
 * @returns subscribe function
 */
function makeDataProviderInternal<QueryData, Data, SubscriptionData, Delta>(
  query: Query<QueryData>,
  subscriptionQuery: Query<SubscriptionData>,
  update: Update<Data, Delta>,
  getData: GetData<QueryData, Data>,
  getDelta: GetDelta<SubscriptionData, Delta>,
  pagination?: {
    getPageInfo: GetPageInfo<QueryData>;
    getTotalCount: GetTotalCount<QueryData>;
    append: Append<Data>;
    first: number;
  },
  fetchPolicy: FetchPolicy = 'no-cache'
): Subscribe<Data, Delta> {
  // list of callbacks passed through subscribe call
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  // subscription is started before initial query, all deltas that will arrive before initial query response are put on queue
  const updateQueue: Delta[] = [];

  let variables: OperationVariables | undefined = undefined;
  let data: Data | null = null;
  let error: Error | undefined = undefined;
  let loading = false;
  let client: ApolloClient<object> | undefined = undefined;
  let subscription: Subscription | undefined = undefined;
  let pageInfo: PageInfo | null = null;
  let totalCount: number | undefined;

  // notify single callback about current state, delta is passes optionally only if notify was invoked onNext
  const notify = (
    callback: UpdateCallback<Data, Delta>,
    dataUpdate?: { delta?: Delta; insertionData?: Data | null }
  ) => {
    callback({
      data,
      error,
      loading,
      pageInfo,
      totalCount,
      ...dataUpdate,
    });
  };

  // notify all callbacks
  const notifyAll = (dataUpdate?: {
    delta?: Delta;
    insertionData?: Data | null;
  }) => {
    callbacks.forEach((callback) => notify(callback, dataUpdate));
  };

  const load = async (params?: Pagination) => {
    if (!client || !pagination || !pageInfo) {
      return Promise.reject();
    }
    const paginationVariables: Pagination = params ?? {
      first: pagination.first,
      after: pageInfo.endCursor,
    };
    const res = await client.query<QueryData>({
      query,
      variables: {
        ...variables,
        pagination: paginationVariables,
      },
      fetchPolicy,
    });
    const insertionData = getData(res.data);
    const insertionDataPageInfo = pagination.getPageInfo(res.data);
    ({ data, pageInfo } = pagination.append(
      data,
      pageInfo,
      insertionData,
      insertionDataPageInfo,
      paginationVariables
    ));
    totalCount = pagination.getTotalCount(res.data);
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
      if (pagination) {
        pageInfo = pagination.getPageInfo(res.data);
        totalCount = pagination.getTotalCount(res.data);
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
    if (subscription || loading) {
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
            const newData = update(data, delta, reload);
            if (newData === data) {
              return;
            }
            data = newData;
            notifyAll({ delta });
          }
        },
        () => reload()
      );
    await initialFetch();
  };

  const reset = (clean = true) => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = undefined;
    }
    data = null;
    error = undefined;
    loading = false;
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
 * const marketMidPriceProvider = makeDataProvider<QueryData, Data, SubscriptionData, Delta>(
 *   gql`query MarketMidPrice($marketId: ID!) { market(id: $marketId) { data { midPrice } } }`,
 *   gql`subscription MarketMidPriceSubscription($marketId: ID!) { marketDepthUpdate(marketId: $marketId) { market { data { midPrice } } } }`,
 *   (draft: Draft<Data>, delta: Delta, reload: (forceReset?: boolean) => void) => { draft.midPrice = delta.midPrice }
 *   (data:QueryData) => data.market.data.midPrice
 *   (delta:SubscriptionData) => delta.marketData.market
 *  )
 *
 * const { unsubscribe, flush, reload } = marketMidPriceProvider(
 *   ({ data, error, loading, delta }) => { ... },
 *   apolloClient,
 *   { id: '1fd726454fa1220038acbf6ff9ac701d8b8bf3f2d77c93a4998544471dc58747' }
 * )
 *
 */
export function makeDataProvider<QueryData, Data, SubscriptionData, Delta>(
  query: Query<QueryData>,
  subscriptionQuery: Query<SubscriptionData>,
  update: Update<Data, Delta>,
  getData: GetData<QueryData, Data>,
  getDelta: GetDelta<SubscriptionData, Delta>,
  pagination?: {
    getPageInfo: GetPageInfo<QueryData>;
    getTotalCount: GetTotalCount<QueryData>;
    append: Append<Data>;
    first: number;
  },
  fetchPolicy: FetchPolicy = 'no-cache'
): Subscribe<Data, Delta> {
  const getInstance = memoize<Data, Delta>(() =>
    makeDataProviderInternal(
      query,
      subscriptionQuery,
      update,
      getData,
      getDelta,
      pagination,
      fetchPolicy
    )
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}
