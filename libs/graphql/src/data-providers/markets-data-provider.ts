import { gql } from '@apollo/client';
import { produce } from 'immer';
import type { ApolloClient } from '@apollo/client';
import type { Subscription } from 'zen-observable-ts';
import { Markets, Markets_markets } from '../__generated__/Markets';

import {
  MarketDataSub,
  MarketDataSub_marketData,
} from '../__generated__/MarketDataSub';

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

export interface MarketsDataProviderCallbackArg {
  data: Markets_markets[] | null;
  error?: Error;
  loading: boolean;
  delta?: MarketDataSub_marketData;
}

export interface MarketsDataProviderCallback {
  (arg: MarketsDataProviderCallbackArg): void;
}

const callbacks: MarketsDataProviderCallback[] = [];
const updateQueue: MarketDataSub_marketData[] = [];

let data: Markets_markets[] | null = null;
let error: Error | undefined = undefined;
let loading = false;
let client: ApolloClient<object> | undefined = undefined;
let subscription: Subscription | undefined = undefined;

const notify = (
  callback: MarketsDataProviderCallback,
  delta?: MarketDataSub_marketData
) => {
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

const update = (
  draft: Markets_markets[] | null,
  delta: MarketDataSub_marketData
) => {
  if (!draft) {
    return;
  }
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
  error = undefined;
  notifyAll();
  if (!client) {
    return;
  }
  subscription = client
    .subscribe<MarketDataSub>({
      query: MARKET_DATA_SUB,
    })
    .subscribe(({ data: delta }) => {
      if (!delta) {
        return;
      }
      if (loading) {
        updateQueue.push(delta.marketData);
      } else {
        const newData = produce(data, (draft) => {
          update(draft, delta.marketData);
        });
        if (newData === data) {
          return;
        }
        data = newData;
        notifyAll(delta.marketData);
      }
    });
  try {
    const res = await client.query<Markets>({
      query: MARKETS_QUERY,
    });
    data = res.data.markets;
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

const unsubscribe = (callback: MarketsDataProviderCallback) => {
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

export const marketsDataProvider = (
  c: ApolloClient<object>,
  callback: MarketsDataProviderCallback
) => {
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
