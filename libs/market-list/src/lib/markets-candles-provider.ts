import compact from 'lodash/compact';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketsCandlesQuery,
  MarketsCandlesQuery_marketsConnection_edges_node as Market,
  MarketsCandlesQuery_marketsConnection_edges_node_candles as Candle,
} from './__generated__';

export const MARKETS_CANDLES_QUERY = gql`
  query MarketsCandlesQuery($interval: Interval!, $since: String!) {
    marketsConnection {
      edges {
        node {
          id
          candles(interval: $interval, since: $since) {
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
`;

export interface MarketCandles {
  marketId: Market['id'];
  candles: Candle[] | undefined;
}

const getData = (responseData: MarketsCandlesQuery): MarketCandles[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => ({
    marketId: edge.node.id,
    candles: compact(edge.node.candles),
  })) || null;

export const marketsCandlesProvider = makeDataProvider<
  MarketsCandlesQuery,
  MarketCandles[],
  never,
  never
>({
  query: MARKETS_CANDLES_QUERY,
  getData,
});
