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
      tradingMode
      state
    }
    auctionEnd
    bestBidPrice
    bestOfferPrice
    markPrice
  }
`;

const MARKETS_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query SimpleMarkets($CandleInterval: Interval!, $CandleSince: String!) {
    markets {
      id
      name
      decimalPlaces
      data {
        ...SimpleMarketDataFields
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

const update = () => true;

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
