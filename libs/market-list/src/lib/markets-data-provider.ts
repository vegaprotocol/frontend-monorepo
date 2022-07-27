import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataSub,
  MarketDataSub_marketData,
  MarketList,
  MarketList_markets,
} from './__generated__';

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
    trigger
  }
`;

export const MARKET_LIST_QUERY = gql`
  query MarketList($interval: Interval!, $since: String!) {
    markets {
      id
      decimalPlaces
      state
      tradingMode
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      data {
        market {
          id
          state
          tradingMode
        }
        bestBidPrice
        bestOfferPrice
        markPrice
        trigger
      }
      tradableInstrument {
        instrument {
          name
          code
          metadata {
            tags
          }
          product {
            ... on Future {
              settlementAsset {
                symbol
              }
            }
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
        high
        low
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

const update = (
  data: MarketList_markets[],
  delta: MarketDataSub_marketData
) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.id === delta.market.id);
    if (index !== -1) {
      draft[index].data = delta;
    }
    // @TODO - else push new market to draft
  });
};

const getData = (responseData: MarketList): MarketList_markets[] | null =>
  responseData.markets;
const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketData =>
  subscriptionData.marketData;

export const marketsDataProvider = makeDataProvider<
  MarketList,
  MarketList_markets[],
  MarketDataSub,
  MarketDataSub_marketData
>(MARKET_LIST_QUERY, MARKET_DATA_SUB, update, getData, getDelta);
