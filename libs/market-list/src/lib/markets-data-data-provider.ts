import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketData, MarketsDataQuery } from './';

export const MARKET_DATA_QUERY = gql`
  query MarketsDataQuery {
    marketsConnection {
      edges {
        node {
          data {
            market {
              id
            }
            bestBidPrice
            bestOfferPrice
            markPrice
            trigger
            staticMidPrice
            marketTradingMode
            indicativeVolume
            indicativePrice
            bestStaticBidPrice
            bestStaticOfferPrice
          }
        }
      }
    }
  }
`;

const getData = (responseData: MarketsDataQuery): MarketData[] | null =>
  responseData.marketsConnection.edges
    .filter((edge) => edge.node.data)
    .map((edge) => edge.node.data as MarketData) || null;

export const marketsDataDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketData[],
  never,
  never
>({
  query: MARKET_DATA_QUERY,
  getData,
});
