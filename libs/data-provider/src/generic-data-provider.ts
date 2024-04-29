import type {
  ApolloClient,
  DocumentNode,
  FetchPolicy,
  OperationVariables,
  TypedDocumentNode,
  FetchResult,
  ErrorPolicy,
  ApolloQueryResult,
  QueryOptions,
} from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import isEqualWith from 'lodash/isEqualWith';
import { isNotFoundGraphQLError } from './helpers';
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
    }
  ): void;
}

export interface Load<Data> {
  (start?: number, end?: number): Promise<Data | null>;
}

export interface Reload {
  (forceReset?: boolean): void;
}

type Pagination = Schema.Pagination;

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}
export interface Subscribe<
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
> {
  (
    callback: UpdateCallback<Data, Delta>,
    client: ApolloClient<object>,
    variables: Variables
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
  Variables extends OperationVariables | undefined = undefined
> {
  (data: Data | null, delta: Delta, reload: Reload, variables: Variables): Data;
}

export interface Append<Data> {
  (
    data: Data | null,
    insertionData: Data | null,
    insertionPageInfo: PageInfo | null,
    pagination?: Pagination
  ): Data | null;
}

interface GetData<QueryData, Data, Variables> {
  (queryData: QueryData | null, variables?: Variables): Data | null;
}

interface GetPageInfo<QueryData> {
  (queryData: QueryData): PageInfo | null;
}

interface GetDelta<SubscriptionData, Delta, Variables> {
  (
    subscriptionData: SubscriptionData,
    variables: Variables,
    client: ApolloClient<object>
  ): Delta;
}

export type Node = { id: string };
export type Cursor = {
  cursor?: string | null;
};
export interface Edge<T extends Node> extends Cursor {
  node: T;
}

export function defaultAppend<T extends Cursor>(
  data: T[] | null,
  insertionData: T[] | null,
  insertionPageInfo: PageInfo | null,
  pagination?: Pagination
) {
  if (data && insertionData && insertionPageInfo) {
    if (!(data instanceof Array) || !(insertionData instanceof Array)) {
      throw new Error(
        'data needs to be instance of Array[] when using pagination'
      );
    }
    if (pagination?.after) {
      if (data[data.length - 1].cursor === pagination?.after) {
        return [...data, ...insertionData];
      }
      const cursors = data.map((item) => item && item.cursor);
      const startIndex = cursors.lastIndexOf(pagination.after);
      if (startIndex !== -1) {
        const start = startIndex + 1;
        const updatedData = [...data.slice(0, start), ...insertionData];
        return updatedData;
      }
    }
  }
  return data;
}

interface DataProviderParams<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables extends OperationVariables | undefined = undefined,
  SubscriptionVariables extends OperationVariables | undefined = Variables,
  QueryVariables extends OperationVariables | undefined = Variables
> {
  query: Query<QueryData>;
  subscriptionQuery?: Query<SubscriptionData>;
  update?: Update<Data | null, Delta, Variables>;
  getData: GetData<QueryData, Data, Variables>;
  getDelta?: GetDelta<SubscriptionData, Delta, Variables>;
  pagination?: {
    getPageInfo: GetPageInfo<QueryData>;
    append: Append<Data>;
    first: number;
  };
  fetchPolicy?: FetchPolicy;
  resetDelay?: number;
  pollInterval?: number;
  additionalContext?: Record<string, unknown>;
  errorPolicy?: ErrorPolicy;
  getQueryVariables?: (variables: Variables) => QueryVariables;
  getSubscriptionVariables?: (
    variables: Variables
  ) => SubscriptionVariables | SubscriptionVariables[];
}

/**
 * @param subscriptionQuery query that will be used for subscription
 * @param update function that will be executed on each onNext, it should update data base on delta, it can reload data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param fetchPolicy
 * @param resetDelay
 * @param additionalContext add property to the context of the query, ie. 'isEnlargedTimeout'
 * @param errorPolicy Apollos error policy, will be used when querying
 * @returns subscribe function
 */
function makeDataProviderInternal<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables extends OperationVariables | undefined = undefined,
  QueryVariables extends OperationVariables | undefined = Variables,
  SubscriptionVariables extends OperationVariables | undefined = Variables
>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
  pagination,
  fetchPolicy,
  resetDelay,
  additionalContext,
  errorPolicy = 'none',
  getQueryVariables,
  getSubscriptionVariables,
  pollInterval,
}: DataProviderParams<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables,
  QueryVariables,
  SubscriptionVariables
>): Subscribe<Data, Delta, Variables> {
  // list of callbacks passed through subscribe call
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  // subscription is started before initial query, all deltas that will arrive before initial query response are put on queue
  const updateQueue: Delta[] = [];

  let initialized = false;
  let resetTimer: ReturnType<typeof setTimeout>;
  let variables: Variables;
  let data: Data | null = null;
  let error: Error | undefined;
  let loading = true;
  let loaded = false;
  let client: ApolloClient<object>;
  let subscription: Subscription[] | undefined;
  let pageInfo: PageInfo | null = null;
  let watchQuerySubscription: Subscription | null = null;

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
      ...updateData,
    });
  };

  // notify all callbacks
  const notifyAll = (updateData?: UpdateData<Data, Delta>) => {
    callbacks.forEach((callback) => notify(callback, updateData));
  };

  const getQueryOptions = (
    pagination?: Pagination,
    policy?: ErrorPolicy
  ): QueryOptions<OperationVariables, QueryData> => ({
    query,
    variables: {
      ...(getQueryVariables ? getQueryVariables(variables) : variables),
      ...(pagination && {
        // let the variables pagination be prior to provider param
        pagination: {
          ...pagination,
          ...(variables?.['pagination'] ?? null),
        },
      }),
    },
    fetchPolicy: fetchPolicy || 'no-cache',
    context: additionalContext,
    errorPolicy: policy || 'none',
    pollInterval,
  });

  const onNext = (res: ApolloQueryResult<QueryData>) => {
    data = getData(res.data, variables);
    if (data && pagination) {
      if (!(data instanceof Array)) {
        throw new Error(
          'data needs to be instance of Edge[] when using pagination'
        );
      }
      pageInfo = pagination.getPageInfo(res.data);
    }
    // if there was some updates received from subscription during initial query loading apply them on just received data
    if (update && data && updateQueue && updateQueue.length > 0) {
      while (updateQueue.length) {
        const delta = updateQueue.shift();
        if (delta) {
          setData(update(data, delta, reload, variables));
        }
      }
    }
    loaded = true;
  };

  const onError = (e: Error) => {
    if (isNotFoundGraphQLError(e, ['party'])) {
      data = getData(null, variables);
      loaded = true;
      return;
    }
    // if error will occur data provider stops subscription
    error = e;
    subscriptionUnsubscribe();
  };

  const onComplete = (isUpdate?: boolean) => {
    loading = false;
    notifyAll({ isUpdate });
  };

  const callWatchQuery = (pagination?: Pagination, policy?: ErrorPolicy) => {
    let onNextCalled = false;
    try {
      watchQuerySubscription = client
        .watchQuery(getQueryOptions(pagination, policy))
        .subscribe(
          (res) => {
            onNext(res);
            onComplete(onNextCalled);
            onNextCalled = true;
          },
          (error) => {
            onError(error as Error);
            onComplete();
          }
        );
    } catch (e) {
      onError(e as Error);
      onComplete();
    }
  };

  const callQuery = (
    pagination?: Pagination,
    policy?: ErrorPolicy
  ): Promise<ApolloQueryResult<QueryData>> => {
    const options = getQueryOptions(pagination, policy);
    return client.query<QueryData>(options);
  };

  const load = async () => {
    if (!pagination) {
      return Promise.reject();
    }
    if (!pageInfo?.hasNextPage) {
      return null;
    }
    const paginationVariables: Pagination = {
      first: pagination.first,
    };
    if (data) {
      const endCursor = (data as Cursor[])[(data as Cursor[]).length - 1]
        .cursor;
      if (endCursor) {
        paginationVariables.after = endCursor;
      }
    }

    const res = await callQuery(paginationVariables, errorPolicy);

    const insertionData = getData(res.data, variables);
    const insertionPageInfo = pagination.getPageInfo(res.data);
    data = pagination.append(
      data,
      insertionData,
      insertionPageInfo,
      paginationVariables
    );
    pageInfo = insertionPageInfo;
    notifyAll({ insertionData, isInsert: true });
    return insertionData;
  };

  const setData = (updatedData: Data | null) => {
    data = updatedData;
  };

  const subscriptionSubscribe = () => {
    if (!subscriptionQuery || !getDelta || !update) {
      return;
    }
    const subscriptionVariables = getSubscriptionVariables
      ? getSubscriptionVariables(variables)
      : variables;
    subscription = ([] as (OperationVariables | undefined)[])
      .concat(subscriptionVariables)
      .map((variables) =>
        client
          .subscribe<SubscriptionData>({
            query: subscriptionQuery,
            variables,
            fetchPolicy,
          })
          .subscribe(subscriptionOnNext, subscriptionOnError)
      );
  };

  const subscriptionUnsubscribe = () => {
    if (subscription) {
      subscription.forEach((subscription) => subscription.unsubscribe());
    }
    subscription = undefined;
  };

  const initialFetch = async (isUpdate = false) => {
    if (!client) {
      return;
    }
    const paginationVariables = pagination
      ? { first: pagination.first }
      : undefined;

    if (pollInterval) {
      callWatchQuery(paginationVariables, errorPolicy);
      return;
    }

    try {
      onNext(await callQuery(paginationVariables, errorPolicy));
    } catch (e) {
      onError(e as Error);
    } finally {
      onComplete(isUpdate);
    }
  };

  // reload function is passed to update and as a returned by subscribe function
  const reload = (forceReset = false) => {
    if (loading) {
      return;
    }
    // hard reset on demand or when error occurs
    if (forceReset || error) {
      reset();
      initialize();
    } else {
      loading = true;
      error = undefined;
      initialFetch(true);
    }
  };

  const subscriptionOnNext = ({
    data: subscriptionData,
  }: FetchResult<SubscriptionData>) => {
    if (!subscriptionData || !getDelta || !update) {
      return;
    }
    const delta = getDelta(subscriptionData, variables, client);
    if (loading) {
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

  const subscriptionOnError = (e: Error) => {
    error = e;
    subscriptionUnsubscribe();
    notifyAll();
  };

  const initialize = async () => {
    if (initialized) {
      return;
    }
    initialized = true;
    loading = true;
    error = undefined;
    notifyAll();
    if (!client) {
      return;
    }
    if (subscriptionQuery && getDelta && update) {
      subscriptionSubscribe();
    }
    await initialFetch();
  };

  const reset = () => {
    if (watchQuerySubscription) {
      watchQuerySubscription.unsubscribe();
    }
    subscriptionUnsubscribe();
    initialized = false;
    data = null;
    error = undefined;
    loading = false;
    loaded = false;
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
    if (!initialized) {
      client = c;
      if (v) {
        variables = v;
      }
      initialize();
    } else {
      clearTimeout(resetTimer);
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
 * Compares two arrays assuming that they are sets of primitive values, used to compare gql query variables
 */
export const variablesIsEqualCustomizer: NonNullable<
  Parameters<typeof isEqualWith>['2']
> = (value, other) => {
  if (Array.isArray(value) && Array.isArray(other)) {
    return (
      value.length === other.length &&
      new Set([...value, ...other]).size === value.length
    );
  }
  return undefined;
};

/**
 * Memoizes data provider instances using query variables as cache key
 *
 * @param fn
 * @returns subscribe function
 */
const memoize = <
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
>(
  fn: () => Subscribe<Data, Delta, Variables>
) => {
  const cache: {
    subscribe: Subscribe<Data, Delta, Variables>;
    variables?: Variables;
  }[] = [];
  return (variables?: Variables) => {
    const cached = cache.find((c) =>
      isEqualWith(c.variables, variables, variablesIsEqualCustomizer)
    );
    if (cached) {
      return cached.subscribe;
    }
    const subscribe = fn();
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
 * @param pagination pagination related functions { getPageInfo, append, first }
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
  Variables extends OperationVariables | undefined = undefined,
  SubscriptionVariables extends OperationVariables | undefined = Variables,
  QueryVariables extends OperationVariables | undefined = Variables
>(
  params: DataProviderParams<
    QueryData,
    Data,
    SubscriptionData,
    Delta,
    Variables,
    SubscriptionVariables,
    QueryVariables
  >
): Subscribe<Data, Delta, Variables> {
  const getInstance = memoize<Data, Delta, Variables>(() =>
    makeDataProviderInternal(params)
  );
  return (callback, client, variables) => {
    const instance = getInstance(variables)(callback, client, variables);
    return instance;
  };
}

/**
 * Dependency subscribe needs to use any as Data and Delta because it's unknown what dependencies will be used.
 * This effects in parts in combine function has any[] type
 */
type DependencySubscribe<
  Variables extends OperationVariables | undefined = undefined
> = Subscribe<any, any, Variables>; // eslint-disable-line @typescript-eslint/no-explicit-any
type DependencyUpdateCallback<
  Variables extends OperationVariables | undefined = undefined
> = Parameters<DependencySubscribe<Variables>>['0'];
export type DerivedPart<
  Variables extends OperationVariables | undefined = undefined
> = Parameters<DependencyUpdateCallback<Variables>>['0'];
export type CombineDerivedData<
  Data,
  Variables extends OperationVariables | undefined = undefined
> = (
  data: DerivedPart<Variables>['data'][],
  variables: Variables,
  prevData: Data | null,
  parts: DerivedPart<Variables>[],
  subscriptions?: ReturnType<DependencySubscribe<Variables>>[]
) => Data | null;

export type CombineDerivedDelta<
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
> = (
  data: Data,
  parts: DerivedPart<Variables>[],
  previousData: Data | null,
  variables?: Variables
) => Delta | undefined;

export type CombineInsertionData<
  Data,
  Variables extends OperationVariables | undefined = undefined
> = (
  data: Data,
  parts: DerivedPart<Variables>[],
  variables?: Variables
) => Data | undefined;

function makeDerivedDataProviderInternal<
  Data,
  Delta,
  Variables extends OperationVariables | undefined = undefined
>(
  dependencies: DependencySubscribe<Variables>[],
  combineData: CombineDerivedData<Data, Variables>,
  combineDelta?: CombineDerivedDelta<Data, Delta, Variables>,
  combineInsertionData?: CombineInsertionData<Data, Variables>
): Subscribe<Data, Delta, Variables> {
  let subscriptions: ReturnType<DependencySubscribe>[] | undefined;
  let client: ApolloClient<object>;
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  let variables: Variables;
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
          variables,
          data,
          parts,
          subscriptions
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
      if (loaded) {
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
      if (v) {
        variables = v;
      }
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
  Variables extends OperationVariables | undefined = undefined
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
