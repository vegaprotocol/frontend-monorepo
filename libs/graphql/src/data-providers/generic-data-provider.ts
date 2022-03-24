import { produce } from 'immer';
import type { Draft } from 'immer';
import type {
  ApolloClient,
  DocumentNode,
  TypedDocumentNode,
} from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';

export function makeDataProvider<QueryData, Data, SubscriptionData, Delta>(
  query: DocumentNode | TypedDocumentNode<QueryData, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  subscriptionQuery: DocumentNode | TypedDocumentNode<SubscriptionData, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  update: (draft: Draft<Data>[] | null, delta: Delta) => void,
  getData: (subscriptionData: QueryData) => Data[] | null,
  getDelta: (subscriptionData: SubscriptionData) => Delta
) {
  type C = (arg: {
    data: Data[] | null;
    error?: Error;
    loading: boolean;
    delta?: Delta;
  }) => void;
  const callbacks: C[] = [];
  const updateQueue: Delta[] = [];

  let data: Data[] | null = null;
  let error: Error | undefined = undefined;
  let loading = false;
  let client: ApolloClient<object> | undefined = undefined;
  let subscription: Subscription | undefined = undefined;

  const notify = (callback: C, delta?: Delta) => {
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
      })
      .subscribe(({ data: subscriptionData }) => {
        if (!subscriptionData) {
          return;
        }
        const delta = getDelta(subscriptionData);
        if (loading) {
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
      const res = await client.query<QueryData>({ query });
      data = getData(res.data);
      if (updateQueue && updateQueue.length > 0) {
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

  const unsubscribe = (callback: C) => {
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

  return (c: ApolloClient<object>, callback: C) => {
    if (!client) {
      client = c;
    }
    callbacks.push(callback);
    if (callbacks.length === 1) {
      initialize();
    } else {
      notify(callback);
    }
    return () => unsubscribe(callback);
  };
}
