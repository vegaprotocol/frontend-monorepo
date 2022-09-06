import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataSub,
  MarketDataSub_marketsData,
  MarketDataQuery,
  MarketDataQuery_marketsConnection_edges_node_data,
} from './__generated__';

export const MARKET_DATA_QUERY = gql`
  query MarketDataQuery($id: ID!) {
    marketsConnection(id: $id) {
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

const MARKET_DATA_SUB = gql`
  subscription MarketDataSub($id: ID!) {
    marketsData(marketIds: [$id]) {
      marketId
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
`;

export type MarketData = MarketDataQuery_marketsConnection_edges_node_data;

const update = (
  data: MarketDataQuery_marketsConnection_edges_node_data,
  delta: MarketDataSub_marketsData
) => {
  return produce(data, (draft) => {
    const { marketId, __typename, ...marketData } = delta;
    Object.assign(draft, marketData);
  });
};

const getData = (
  responseData: MarketDataQuery
): MarketDataQuery_marketsConnection_edges_node_data | null =>
  responseData.marketsConnection.edges[0].node.data || null;

const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketsData =>
  subscriptionData.marketsData[0];

export const marketsDataDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketDataQuery_marketsConnection_edges_node_data,
  MarketDataSub,
  MarketDataSub_marketsData
>({
  query: MARKET_DATA_QUERY,
  subscriptionQuery: MARKET_DATA_SUB,
  update,
  getData,
  getDelta,
});
