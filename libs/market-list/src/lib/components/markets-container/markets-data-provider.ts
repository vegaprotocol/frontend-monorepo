import produce from 'immer';
import { gql } from '@apollo/client';
import type {
  Markets,
  Markets_markets,
} from '../../components/__generated__/Markets';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

import type {
  MarketDataSub,
  MarketDataSub_marketData,
} from '../../components/__generated__/MarketDataSub';

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

export const MARKET_LIST_QUERY = gql`
  query MarketList($interval: Interval!, $since: String!) {
    markets {
      id
      decimalPlaces
      state
      data {
        market {
          id
        }
        markPrice
      }
      tradableInstrument {
        instrument {
          name
          code
          metadata {
            tags
          }
        }
      }
      marketTimestamps {
        open
        close
      }
      candles(interval: $interval, since: $since) {
        open
        close
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

const update = (data: Markets_markets[], delta: MarketDataSub_marketData) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.id === delta.market.id);
    if (index !== -1) {
      draft[index].data = delta;
    }
    // @TODO - else push new market to draft
  });
};

const getData = (responseData: Markets): Markets_markets[] | null =>
  responseData.markets;
const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketData =>
  subscriptionData.marketData;

export const marketsDataProvider = makeDataProvider<
  Markets,
  Markets_markets[],
  MarketDataSub,
  MarketDataSub_marketData
>(MARKETS_QUERY, MARKET_DATA_SUB, update, getData, getDelta);
