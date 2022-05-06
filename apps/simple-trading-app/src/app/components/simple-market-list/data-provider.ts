import { gql } from '@apollo/client';
import type {
  MarketDataSub,
  MarketDataSub_marketData,
  Markets,
  Markets_markets,
} from '@vegaprotocol/market-list';
import { makeDataProvider } from '@vegaprotocol/react-helpers';

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketDataFields on MarketData {
    market {
      id
      state
      tradingMode
      state
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

const update = () => true;

const getData = (responseData: Markets) => responseData.markets;
const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketData =>
  subscriptionData.marketData;

// export const dataProvider = marketsDataProvider<any,
export const dataProvider = makeDataProvider<
  Markets,
  Markets_markets[],
  MarketDataSub,
  MarketDataSub_marketData
>(MARKETS_QUERY, MARKET_DATA_SUB, update, getData, getDelta);

export default dataProvider;
