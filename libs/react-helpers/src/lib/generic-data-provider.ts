import type {
  ApolloClient,
  DocumentNode,
  FetchPolicy,
  OperationVariables,
  TypedDocumentNode,
  FetchResult,
} from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import isEqual from 'lodash/isEqual';
import type * as Schema from '@vegaprotocol/types';
interface UpdateData<Data, Delta> {
  delta?: Delta;
  isUpdate?: boolean;
  insertionData?: Data | null;
  isInsert?: boolean;
}
export interface UpdateCallback<Data, Delta> {
  (
    arg: UpdateData<Data, Delta> & {
      data: Data | null;
      error?: Error;
      loading: boolean;
      loaded: boolean;
      pageInfo: PageInfo | null;
      totalCount?: number;
    }
  ): void;
}

export interface Load<Data> {
  (start?: number, end?: number): Promise<Data | null>;
}

export interface Reload {
  (forceReset?: boolean): void;
}

type Pagination = Schema.Pagination & {
  skip?: number;
};

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
export interface Subscribe<
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
> {
  (
    callback: UpdateCallback<Data, Delta>,
    client: ApolloClient<object>,
    variables?: Variables
  ): {
    unsubscribe: () => void;
    reload: Reload;
    flush: () => void;
    load?: Load<Data>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Query<Result> = DocumentNode | TypedDocumentNode<Result, any>;

export interface Update<
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
> {
  (data: Data, delta: Delta, reload: Reload, variables?: Variables): Data;
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

interface GetData<QueryData, Data, Variables> {
  (queryData: QueryData, variables?: Variables): Data | null;
}

interface GetPageInfo<QueryData> {
  (queryData: QueryData): PageInfo | null;
}

interface GetTotalCount<QueryData> {
  (queryData: QueryData): number | undefined;
}

interface GetDelta<SubscriptionData, Delta, Variables> {
  (subscriptionData: SubscriptionData, variables?: Variables): Delta;
}

export type Node = { id: string };
export type Cursor = {
  cursor?: string | null;
};
export interface Edge<T extends Node> extends Cursor {
  node: T;
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
        'data needs to be instance of Edge[] when using pagination'
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

interface DataProviderParams<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables extends OperationVariables = OperationVariables
> {
  query: Query<QueryData>;
  subscriptionQuery?: Query<SubscriptionData>;
  update?: Update<Data, Delta, Variables>;
  getData: GetData<QueryData, Data, Variables>;
  getDelta?: GetDelta<SubscriptionData, Delta, Variables>;
  pagination?: {
    getPageInfo: GetPageInfo<QueryData>;
    getTotalCount?: GetTotalCount<QueryData>;
    append: Append<Data>;
    first: number;
  };
  fetchPolicy?: FetchPolicy;
  resetDelay?: number;
}

/**
 * @param subscriptionQuery query that will be used for subscription
 * @param update function that will be executed on each onNext, it should update data base on delta, it can reload data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param fetchPolicy
 * @returns subscribe function
 */
function makeDataProviderInternal<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables extends OperationVariables = OperationVariables
>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
  pagination,
  fetchPolicy,
  resetDelay,
}: DataProviderParams<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables
>): Subscribe<Data, Delta, Variables> {
  // list of callbacks passed through subscribe call
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  // subscription is started before initial query, all deltas that will arrive before initial query response are put on queue
  const updateQueue: Delta[] = [];

  let resetTimer: ReturnType<typeof setTimeout>;
  let variables: Variables | undefined;
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
    updateData?: UpdateData<Data, Delta>
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
  const notifyAll = (updateData?: UpdateData<Data, Delta>) => {
    callbacks.forEach((callback) => notify(callback, updateData));
  };

  const load = async (start?: number, end?: number) => {
    if (!pagination) {
      return Promise.reject();
    }
    const paginationVariables: Pagination = {
      first: pagination.first,
      after: pageInfo?.endCursor,
    };
    if (start !== undefined && data instanceof Array) {
      if (!start) {
        paginationVariables.after = undefined;
      } else if (data && data[start - 1]) {
        paginationVariables.after = (data[start - 1] as Cursor).cursor;
      } else {
        let skip = 1;
        while (!data[start - 1 - skip] && skip <= start) {
          skip += 1;
        }
        paginationVariables.skip = skip;
        if (skip === start) {
          paginationVariables.after = undefined;
        } else {
          paginationVariables.after = (data[start - 1 - skip] as Cursor).cursor;
        }
      }
    } else if (!pageInfo?.hasNextPage) {
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
    const insertionData = getData(res.data, variables);
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
    notifyAll({ insertionData, isInsert: true });
    return insertionData;
  };

  const setData = (updatedData: Data | null) => {
    data = updatedData;
    if (totalCount !== undefined && data instanceof Array) {
      totalCount = data.length;
    }
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
        fetchPolicy: fetchPolicy || 'no-cache',
      });
      data = getData(res.data, variables);
      if (data && pagination) {
        if (!(data instanceof Array)) {
          throw new Error(
            'data needs to be instance of Edge[] when using pagination'
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
      if (update && data && updateQueue && updateQueue.length > 0) {
        while (updateQueue.length) {
          const delta = updateQueue.shift();
          if (delta) {
            setData(update(data, delta, reload, variables));
            if (totalCount !== undefined && data instanceof Array) {
              totalCount = data.length;
            }
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

  const onNext = ({
    data: subscriptionData,
  }: FetchResult<SubscriptionData>) => {
    if (!subscriptionData || !getDelta || !update) {
      return;
    }
    const delta = getDelta(subscriptionData, variables);
    if (loading || !data) {
      updateQueue.push(delta);
    } else {
      const updatedData = update(data, delta, reload, variables);
      if (updatedData === data) {
        return;
      }
      setData(updatedData);
      notifyAll({ delta, isUpdate: true });
    }
  };

  const initialize = async () => {
    if (subscription) {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      return;
    }
    loading = true;
    error = undefined;
    notifyAll();
    if (!client) {
      return;
    }

    if (subscriptionQuery && getDelta && update) {
      subscription = client
        .subscribe<SubscriptionData>({
          query: subscriptionQuery,
          variables,
          fetchPolicy,
        })
        .subscribe(onNext, (e) => {
          error = e as Error;
          if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
          }
          notifyAll();
        });
    }
    await initialFetch();
  };

  const reset = () => {
    if (!subscription) {
      return;
    }
    subscription.unsubscribe();
    subscription = undefined;
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
      if (resetDelay) {
        resetTimer = setTimeout(reset, resetDelay);
      } else {
        reset();
      }
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
const memoize = <
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
>(
  fn: (variables?: Variables) => Subscribe<Data, Delta, Variables>
) => {
  const cache: {
    subscribe: Subscribe<Data, Delta, Variables>;
    variables?: Variables;
  }[] = [];
  return (variables?: Variables) => {
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
 *   update: (draft: Draft<Data>, delta: Delta, reload: Reload) => { draft.midPrice = delta.midPrice }
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
export function makeDataProvider<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables extends OperationVariables = OperationVariables
>(
  params: DataProviderParams<
    QueryData,
    Data,
    SubscriptionData,
    Delta,
    Variables
  >
): Subscribe<Data, Delta, Variables> {
  const getInstance = memoize<Data, Delta, Variables>(() =>
    makeDataProviderInternal(params)
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}

/**
 * Dependency subscribe needs to use any as Data and Delta because it's unknown what dependencies will be used.
 * This effects in parts in combine function has any[] type
 */
type DependencySubscribe<
  Variables extends OperationVariables = OperationVariables
> = Subscribe<any, any, Variables>; // eslint-disable-line @typescript-eslint/no-explicit-any
type DependencyUpdateCallback<
  Variables extends OperationVariables = OperationVariables
> = Parameters<DependencySubscribe<Variables>>['0'];
export type DerivedPart<
  Variables extends OperationVariables = OperationVariables
> = Parameters<DependencyUpdateCallback<Variables>>['0'];
export type CombineDerivedData<
  Data,
  Variables extends OperationVariables = OperationVariables
> = (
  data: DerivedPart<Variables>['data'][],
  variables?: Variables
) => Data | null;

export type CombineDerivedDelta<
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
> = (
  data: Data,
  parts: DerivedPart<Variables>[],
  previousData: Data | null,
  variables?: Variables
) => Delta | undefined;

export type CombineInsertionData<
  Data,
  Variables extends OperationVariables = OperationVariables
> = (
  data: Data,
  parts: DerivedPart<Variables>[],
  variables?: Variables
) => Data | undefined;

function makeDerivedDataProviderInternal<
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
>(
  dependencies: DependencySubscribe<Variables>[],
  combineData: CombineDerivedData<Data, Variables>,
  combineDelta?: CombineDerivedDelta<Data, Delta, Variables>,
  combineInsertionData?: CombineInsertionData<Data, Variables>
): Subscribe<Data, Delta, Variables> {
  let subscriptions: ReturnType<DependencySubscribe>[] | undefined;
  let client: ApolloClient<object>;
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  let variables: Variables | undefined;
  const parts: DerivedPart<Variables>[] = [];
  let data: Data | null = null;
  let error: Error | undefined;
  let loading = true;
  let loaded = false;

  const notify = (
    callback: UpdateCallback<Data, Delta>,
    updateData?: UpdateData<Data, Delta>
  ) => {
    callback({
      data,
      error,
      loading,
      loaded,
      pageInfo: parts[0]?.pageInfo || null,
      ...updateData,
    });
  };

  // notify all callbacks
  const notifyAll = (updateData?: UpdateData<Data, Delta>) =>
    callbacks.forEach((callback) => {
      notify(callback, updateData);
    });

  const combine = (updatedPartIndex: number) => {
    let delta: Delta | undefined;
    let isUpdate = false;
    let isInsert = false;
    let insertionData: Data | undefined;
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
      ? combineData(
          parts.map((part) => part.data),
          variables
        )
      : data;
    if (
      newLoading !== loading ||
      newError !== error ||
      newLoaded !== loaded ||
      newData !== data
    ) {
      loading = newLoading;
      error = newError;
      loaded = newLoaded;
      const previousData = data;
      data = newData;
      if (newLoaded) {
        const updatedPart = parts[updatedPartIndex];
        if (updatedPart.isUpdate) {
          isUpdate = true;
          if (combineDelta && data) {
            delta = combineDelta(data, parts, previousData, variables);
          }
          delete updatedPart.isUpdate;
          delete updatedPart.delta;
        }
        if (updatedPart.isInsert) {
          isInsert = updatedPartIndex === 0;
          if (updatedPart.insertionData && combineInsertionData && data) {
            insertionData = combineInsertionData(data, parts, variables);
          }
          delete updatedPart.insertionData;
          delete updatedPart.isInsert;
        }
      }
      notifyAll({
        isUpdate,
        isInsert,
        delta,
        insertionData,
      });
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
          combine(i);
        },
        client,
        variables
      )
    );
  };

  // remove callback from list, and unsubscribe if there is no more callbacks registered
  const unsubscribe = (callback: UpdateCallback<Data, Delta>) => {
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
      load: subscriptions && subscriptions[0]?.load,
    };
  };
}

export function makeDerivedDataProvider<
  Data,
  Delta,
  Variables extends OperationVariables = OperationVariables
>(
  dependencies: DependencySubscribe<Variables>[],
  combineData: CombineDerivedData<Data, Variables>,
  combineDelta?: CombineDerivedDelta<Data, Delta, Variables>,
  combineInsertionData?: CombineInsertionData<Data, Variables>
): Subscribe<Data, Delta, Variables> {
  const getInstance = memoize<Data, Delta, Variables>(() =>
    makeDerivedDataProviderInternal<Data, Delta, Variables>(
      dependencies,
      combineData,
      combineDelta,
      combineInsertionData
    )
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}
