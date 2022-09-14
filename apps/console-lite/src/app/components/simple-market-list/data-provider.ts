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

export const MARKETS_QUERY = gql`
  query SimpleMarkets($CandleSince: String!) {
    markets {
      id
      state
      name
      tradableInstrument {
        instrument {
          code
          name
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
      candles(interval: INTERVAL_I1H, since: $CandleSince) {
        open
        close
      }
    }
  }
`;

const MARKET_DATA_SUB = gql`
  subscription SimpleMarketDataSub {
    marketData {
      market {
        id
        state
      }
    }
  }
`;

export const CANDLE_SUB = gql`
  subscription CandleLive($marketId: ID!) {
    candles(marketId: $marketId, interval: INTERVAL_I1H) {
      close
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
      draft[index].state = delta.market.state;
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
>({
  query: MARKETS_QUERY,
  subscriptionQuery: MARKET_DATA_SUB,
  update,
  getData,
  getDelta,
});

export default dataProvider;
