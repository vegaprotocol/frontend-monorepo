import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketsDataQuery } from './__generated__/MarketsDataQuery';
import type { MarketData } from './market-data-provider';

export const MARKETS_DATA_QUERY = gql`
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

export const marketsDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketData[],
  never,
  never
>({
  query: MARKETS_DATA_QUERY,
  getData,
});
