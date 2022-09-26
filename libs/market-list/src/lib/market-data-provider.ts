import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataSub,
  MarketDataSub_marketsData,
} from './__generated__/MarketDataSub';
import type {
  MarketDataQuery,
  MarketDataQuery_marketsConnection_edges_node_data,
} from './__generated__/MarketDataQuery';

export const MARKET_DATA_QUERY = gql`
  query MarketDataQuery($marketId: ID!) {
    marketsConnection(id: $marketId) {
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
  subscription MarketDataSub($marketId: ID!) {
    marketsData(marketIds: [$marketId]) {
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

const update = (data: MarketData, delta: MarketDataSub_marketsData) => {
  return produce(data, (draft) => {
    const { marketId, __typename, ...marketData } = delta;
    Object.assign(draft, marketData);
  });
};

const getData = (responseData: MarketDataQuery): MarketData | null =>
  responseData?.marketsConnection?.edges[0].node.data || null;

const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketsData =>
  subscriptionData.marketsData[0];

export const marketDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketData,
  MarketDataSub,
  MarketDataSub_marketsData
>({
  query: MARKET_DATA_QUERY,
  subscriptionQuery: MARKET_DATA_SUB,
  update,
  getData,
  getDelta,
});
