import { produce } from 'immer';
import type { Draft } from 'immer';
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
    delta?: Delta;
  }): void;
}
export interface Subscribe<Data, Delta> {
  (
    callback: UpdateCallback<Data, Delta>,
    client: ApolloClient<object>,
    variables?: OperationVariables
  ): {
    unsubscribe: () => void;
    restart: (force?: boolean) => void;
    flush: () => void;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query<Result> = DocumentNode | TypedDocumentNode<Result, any>;

export interface Update<Data, Delta> {
  (draft: Draft<Data>, delta: Delta, restart: (force?: boolean) => void): void;
}

interface GetData<QueryData, Data> {
  (subscriptionData: QueryData): Data | null;
}

interface GetDelta<SubscriptionData, Delta> {
  (subscriptionData: SubscriptionData): Delta;
}

/**
 * @param subscriptionQuery query that will be used for subscription
 * @param update function that will be executed on each onNext, it should update data base on delta, it can restart data provider
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

  // notify single callback about current state, delta is passes optionally only if notify was invoked onNext
  const notify = (callback: UpdateCallback<Data, Delta>, delta?: Delta) => {
    callback({
      data,
      error,
      loading,
      delta,
    });
  };

  // notify all callbacks
  const notifyAll = (delta?: Delta) => {
    callbacks.forEach((callback) => notify(callback, delta));
  };

  const initialFetch = async () => {
    if (!client) {
      return;
    }
    try {
      const res = await client.query<QueryData>({
        query,
        variables,
        fetchPolicy,
      });
      data = getData(res.data);
      // if there was some updates received from subscription during initial query loading apply them on just received data
      if (data && updateQueue && updateQueue.length > 0) {
        data = produce(data, (draft) => {
          while (updateQueue.length) {
            const delta = updateQueue.shift();
            if (delta) {
              update(draft, delta, restart);
            }
          }
        });
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

  // restart function is passed to update and as a returned by subscribe function
  const restart = (hard = false) => {
    if (loading) {
      return;
    }
    // hard reset on demand or when there is no apollo subscription yet
    if (hard || !subscription) {
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
            const newData = produce(data, (draft) => {
              update(draft, delta, restart);
            });
            if (newData === data) {
              return;
            }
            data = newData;
            notifyAll(delta);
          }
        },
        () => restart()
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
    notifyAll();
  };

  // remove callback from list, and unsubscribe if there is no more callbacks registered
  const unsubscribe = (callback: UpdateCallback<Data, Delta>) => {
    callbacks.splice(callbacks.indexOf(callback), 1);
    if (callbacks.length === 0) {
      reset();
    }
  };

  //
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
      restart,
      flush: () => notify(callback),
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
 * @param update Update<Data, Delta> function that will be executed on each onNext, it should update data base on delta, it can restart data provider
 * @param getData transforms received query data to format that will be stored in data provider
 * @param getDelta transforms delta data to format that will be stored in data provider
 * @param fetchPolicy
 * @returns Subscribe<Data, Delta> subscribe function
 * @example
 * const marketMidPriceProvider = makeDataProvider<QueryData, Data, SubscriptionData, Delta>(
 *   gql`query MarketMidPrice($marketId: ID!) { market(id: $marketId) { data { midPrice } } }`,
 *   gql`subscription MarketMidPriceSubscription($marketId: ID!) { marketDepthUpdate(marketId: $marketId) { market { data { midPrice } } } }`,
 *   (draft: Draft<Data>, delta: Delta, restart: (force?: boolean) => void) => { draft.midPrice = delta.midPrice }
 *   (data:QueryData) => data.market.data.midPrice
 *   (delta:SubscriptionData) => delta.marketData.market
 *  )
 *
 * const { unsubscribe, flush, restart } = marketMidPriceProvider(
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
  fetchPolicy: FetchPolicy = 'no-cache'
): Subscribe<Data, Delta> {
  const getInstance = memoize<Data, Delta>(() =>
    makeDataProviderInternal(
      query,
      subscriptionQuery,
      update,
      getData,
      getDelta,
      fetchPolicy
    )
  );
  return (callback, client, variables) =>
    getInstance(variables)(callback, client, variables);
}
