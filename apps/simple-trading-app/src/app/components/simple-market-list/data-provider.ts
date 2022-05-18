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
    auctionEnd
  }
`;

const MARKETS_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query SimpleMarkets($CandleInterval: Interval!, $CandleSince: String!) {
    markets {
      id
      name
      data {
        ...SimpleMarketDataFields
      }
      tradableInstrument {
        instrument {
          product {
            ... on Future {
              settlementAsset {
                symbol
              }
            }
          }
        }
      }
      candles(interval: $CandleInterval, since: $CandleSince) {
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

const update = (
  draft: SimpleMarkets_markets[],
  delta: SimpleMarketDataSub_marketData
) => {
  const index = draft.findIndex((m) => m.id === delta.market.id);
  if (index !== -1) {
    draft[index].data = delta;
  }
  // @TODO - else push new market to draft
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
