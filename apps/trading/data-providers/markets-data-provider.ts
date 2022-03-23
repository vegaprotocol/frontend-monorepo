import { gql } from '@apollo/client';
import { produce } from 'immer';
import type { ApolloClient } from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import {
  Markets,
  Markets_markets,
  MarketDataSub,
  MarketDataSub_marketData,
} from '@vegaprotocol/graphql';

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketDataFields on MarketData {
    market {
      id
      state
      tradingMode
    }
    bestBidPrice
    bestOfferPrice
    markPrice
  }
`;

const MARKETS_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query Markets {
    markets {
      id
      name
      decimalPlaces
      data {
        ...MarketDataFields
      }
      tradableInstrument {
        instrument {
          code
          product {
            ... on Future {
              settlementAsset {
                symbol
              }
            }
          }
        }
      }
    }
  }
`;

const MARKET_DATA_SUB = gql`
  ${MARKET_DATA_FRAGMENT}
  subscription MarketDataSub {
    marketData {
      ...MarketDataFields
    }
  }
`;

export interface CallbackArg {
  data?: Markets_markets[];
  error?: Error;
  loading: boolean;
  delta?: MarketDataSub_marketData;
}

export interface Callback {
  (arg: CallbackArg): void;
}

const callbacks: Callback[] = [];
const updateQueue: MarketDataSub_marketData[] = [];

let data: Markets_markets[] = undefined;
let error: Error = undefined;
let loading = false;
let client: ApolloClient<object> = undefined;
let subscription: Subscription = undefined;

const notify = (callback, delta?: MarketDataSub_marketData) => {
  callback({
    data,
    error,
    loading,
    delta,
  });
};

const notifyAll = (delta?: MarketDataSub_marketData) => {
  callbacks.forEach((callback) => notify(callback, delta));
};

const update = (draft: Markets_markets[], delta: MarketDataSub_marketData) => {
  const index = draft.findIndex((m) => m.id === delta.market.id);
  if (index !== -1) {
    draft[index].data = delta;
  }
  // @TODO - else push new market to draft
};

const initialize = async () => {
  if (subscription) {
    return;
  }
  loading = true;
  error = null;
  notifyAll();
  subscription = client
    .subscribe<MarketDataSub>({
      query: MARKET_DATA_SUB,
    })
    .subscribe(({ data: delta }) => {
      if (loading) {
        updateQueue.push(delta.marketData);
      } else {
        data = produce(data, (draft) => {
          update(draft, delta.marketData);
        });
        notifyAll(delta.marketData);
      }
    });
  try {
    const res = await client.query<Markets>({
      query: MARKETS_QUERY,
    });
    data = res.data.markets;
    if (updateQueue) {
      data = produce(data, (draft) => {
        while (updateQueue.length) {
          update(draft, updateQueue.shift());
        }
      });
    }
  } catch (e) {
    error = e;
    subscription.unsubscribe();
    subscription = undefined;
  } finally {
    loading = false;
    notifyAll();
  }
};

const unsubscribe = (callback: Callback) => {
  callbacks.splice(callbacks.indexOf(callback), 1);
  if (callbacks.length === 0) {
    subscription.unsubscribe();
    subscription = undefined;
    data = undefined;
    error = undefined;
    loading = false;
  }
};

export const subscribe = (c: ApolloClient<object>, callback) => {
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
