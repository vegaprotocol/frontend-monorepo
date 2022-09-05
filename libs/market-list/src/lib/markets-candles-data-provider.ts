import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketsCandles,
  MarketsCandles_marketsConnection_edges_node,
  MarketsCandles_marketsConnection_edges_node_candlesConnection_edges_node,
} from './__generated__';

export const MARKETS_CANDLES_QUERY = gql`
  query MarketsCandles($interval: Interval!, $since: String!) {
    marketsConnection {
      edges {
        node {
          id
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

interface MarketCandlesData {
  marketId: MarketsCandles_marketsConnection_edges_node['id'];
  candles:
    | MarketsCandles_marketsConnection_edges_node_candlesConnection_edges_node[]
    | undefined;
}

const getData = (responseData: MarketsCandles): MarketCandlesData[] | null =>
  responseData.marketsConnection.edges.map((edge) => ({
    marketId: edge.node.id,
    candles: edge.node.candlesConnection.edges
      ?.filter((edge) => edge?.node)
      .map(
        (edge) =>
          edge?.node as MarketsCandles_marketsConnection_edges_node_candlesConnection_edges_node
      ),
  })) || null;

export const marketsCandlesDataProvider = makeDataProvider<
  MarketsCandles,
  MarketCandlesData[],
  never,
  never
>({
  query: MARKETS_CANDLES_QUERY,
  getData,
});
