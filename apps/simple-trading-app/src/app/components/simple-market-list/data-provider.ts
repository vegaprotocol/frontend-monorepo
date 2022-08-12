import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  SimpleMarkets,
  SimpleMarkets_markets,
} from './__generated__/SimpleMarkets';
import type {
  SimpleMarketDataSub,
  SimpleMarketDataSub_marketData,
} from './__generated__/SimpleMarketDataSub';

const MARKET_DATA_FRAGMENT = gql`
  fragment SimpleMarketDataFields on MarketData {
    market {
      id
      state
    }
  }
`;

export const MARKETS_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query SimpleMarkets($CandleSince: String!) {
    markets {
      id
      name
      data {
        ...SimpleMarketDataFields
      }
      tradableInstrument {
        instrument {
          id
          code
          metadata {
            tags
          }
          product {
            __typename
            ... on Future {
              quoteName
              settlementAsset {
                symbol
              }
            }
          }
        }
      }
      candles(interval: I1H, since: $CandleSince) {
        open
        close
      }
    }
  }
`;

const MARKET_DATA_SUB = gql`
  ${MARKET_DATA_FRAGMENT}
  subscription SimpleMarketDataSub {
    marketData {
      ...SimpleMarketDataFields
    }
  }
`;

export const CANDLE_SUB = gql`
  subscription CandleLive($marketId: ID!) {
    candles(marketId: $marketId, interval: I1H) {
      close
    }
  }
`;

export const FILTERS_QUERY = gql`
  query MarketFilters {
    markets {
      tradableInstrument {
        instrument {
          product {
            __typename
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

const update = (
  data: SimpleMarkets_markets[],
  delta: SimpleMarketDataSub_marketData
) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.id === delta.market.id);
    if (index !== -1) {
      draft[index].data = delta;
    }
    // @TODO - else push new market to draft
  });
};

const getData = (responseData: SimpleMarkets) => responseData.markets;
const getDelta = (
  subscriptionData: SimpleMarketDataSub
): SimpleMarketDataSub_marketData => subscriptionData.marketData;

export const dataProvider = makeDataProvider<
  SimpleMarkets,
  SimpleMarkets_markets[],
  SimpleMarketDataSub,
  SimpleMarketDataSub_marketData
>(MARKETS_QUERY, MARKET_DATA_SUB, update, getData, getDelta);

export default dataProvider;
