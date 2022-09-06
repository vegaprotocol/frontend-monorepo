import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketsCandlesQuery,
  MarketsCandlesQuery_marketsConnection_edges_node,
  MarketsCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node,
} from './__generated__';

export const MARKETS_CANDLES_QUERY = gql`
  query MarketsCandlesQuery($interval: Interval!, $since: String!) {
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

export interface MarketCandles {
  marketId: MarketsCandlesQuery_marketsConnection_edges_node['id'];
  candles:
    | MarketsCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node[]
    | undefined;
}

const getData = (responseData: MarketsCandlesQuery): MarketCandles[] | null =>
  responseData.marketsConnection.edges.map((edge) => ({
    marketId: edge.node.id,
    candles: edge.node.candlesConnection.edges
      ?.filter((edge) => edge?.node)
      .map(
        (edge) =>
          edge?.node as MarketsCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node
      ),
  })) || null;

export const marketsCandlesDataProvider = makeDataProvider<
  MarketsCandlesQuery,
  MarketCandles[],
  never,
  never
>({
  query: MARKETS_CANDLES_QUERY,
  getData,
});
