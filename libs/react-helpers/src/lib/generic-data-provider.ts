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
  ): () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query<Result> = DocumentNode | TypedDocumentNode<Result, any>;

interface Update<Data, Delta> {
  (draft: Draft<Data>, delta: Delta): void;
}

interface GetData<QueryData, Data> {
  (subscriptionData: QueryData): Data | null;
}

interface GetDelta<SubscriptionData, Delta> {
  (subscriptionData: SubscriptionData): Delta;
}

function makeDataProviderInternal<QueryData, Data, SubscriptionData, Delta>(
  query: Query<QueryData>,
  subscriptionQuery: Query<SubscriptionData>,
  update: Update<Data, Delta>,
  getData: GetData<QueryData, Data>,
  getDelta: GetDelta<SubscriptionData, Delta>,
  fetchPolicy: FetchPolicy = 'no-cache'
): Subscribe<Data, Delta> {
  const callbacks: UpdateCallback<Data, Delta>[] = [];
  const updateQueue: Delta[] = [];

  let variables: OperationVariables | undefined = undefined;
  let data: Data | null = null;
  let error: Error | undefined = undefined;
  let loading = false;
  let client: ApolloClient<object> | undefined = undefined;
  let subscription: Subscription | undefined = undefined;

  const notify = (callback: UpdateCallback<Data, Delta>, delta?: Delta) => {
    callback({
      data,
      error,
      loading,
      delta,
    });
  };

  const notifyAll = (delta?: Delta) => {
    callbacks.forEach((callback) => notify(callback, delta));
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
        fetchPolicy: 'no-cache',
      })
      .subscribe(({ data: subscriptionData }) => {
        if (!subscriptionData) {
          return;
        }
        const delta = getDelta(subscriptionData);
        if (loading || !data) {
          updateQueue.push(delta);
        } else {
          const newData = produce(data, (draft) => {
            update(draft, delta);
          });
          if (newData === data) {
            return;
          }
          data = newData;
          notifyAll(delta);
        }
      });
    try {
      const res = await client.query<QueryData>({
        query,
        variables,
        fetchPolicy,
      });
      data = getData(res.data);
      if (data && updateQueue && updateQueue.length > 0) {
        data = produce(data, (draft) => {
          while (updateQueue.length) {
            const delta = updateQueue.shift();
            if (delta) {
              update(draft, delta);
            }
          }
        });
      }
    } catch (e) {
      error = e as Error;
      subscription.unsubscribe();
      subscription = undefined;
    } finally {
      loading = false;
      notifyAll();
    }
  };

  const unsubscribe = (callback: UpdateCallback<Data, Delta>) => {
    callbacks.splice(callbacks.indexOf(callback), 1);
    if (callbacks.length === 0) {
      if (subscription) {
        subscription.unsubscribe();
        subscription = undefined;
      }
      data = null;
      error = undefined;
      loading = false;
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
    return () => unsubscribe(callback);
  };
}

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
