import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketCandles,
  MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node,
  MarketCandlesSub,
  MarketCandlesSub_candles,
} from './__generated__';

export const MARKET_CANDLES_QUERY = gql`
  query MarketCandles($interval: Interval!, $since: String!, $marketId: ID!) {
    marketsConnection(id: $marketId) {
      edges {
        node {
          candlesConnection(interval: $interval, since: $since) {
            edges {
              node {
                high
                low
                open
                close
                volume
              }
            }
          }
        }
      }
    }
  }
`;

const MARKET_CANDLES_SUB = gql`
  subscription MarketCandlesSub($marketId: ID!, $interval: Interval!) {
    candles(interval: $interval, marketId: $marketId) {
      high
      low
      open
      close
      volume
    }
  }
`;

const update = (
  data: MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node[],
  delta: MarketCandlesSub_candles
) => {
  return data && delta
    ? [
        ...data,
        {
          ...delta,
          __typename: 'CandleNode',
        } as MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node,
      ]
    : data;
};

const getData = (
  responseData: MarketCandles
):
  | MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node[]
  | null =>
  responseData.marketsConnection.edges[0].node.candlesConnection.edges
    ?.filter((edge) => edge?.node)
    .map(
      (edge) =>
        edge?.node as MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node
    ) || null;

const getDelta = (
  subscriptionData: MarketCandlesSub
): MarketCandlesSub_candles => subscriptionData.candles;

export const marketCandlesDataProvider = makeDataProvider<
  MarketCandles,
  MarketCandles_marketsConnection_edges_node_candlesConnection_edges_node[],
  MarketCandlesSub,
  MarketCandlesSub_candles
>({
  query: MARKET_CANDLES_QUERY,
  subscriptionQuery: MARKET_CANDLES_SUB,
  update,
  getData,
  getDelta,
});
