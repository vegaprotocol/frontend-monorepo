import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  MarketsV2Document,
  type MarketFieldsV2Fragment,
  type MarketsV2Query,
  type MarketsV2QueryVariables,
} from './__generated__/Markets';
import { MarketState } from '@vegaprotocol/types';
import { MIN } from '@vegaprotocol/utils';

export type Market = MarketFieldsV2Fragment;

export const useMarkets = () => {
  const client = useApolloClient();
  const queryResult = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const result = await client.query<
        MarketsV2Query,
        MarketsV2QueryVariables
      >({
        query: MarketsV2Document,
        fetchPolicy: 'no-cache',
      });

      const markets = new Map<string, Market>();

      if (!result.data.marketsConnection?.edges.length) {
        return markets;
      }

      for (const edge of result.data.marketsConnection.edges) {
        const m = edge.node;
        markets.set(m.id, m);
      }

      return markets;
    },
    staleTime: MIN * 10,
  });

  return queryResult;
};

export const useActiveMarkets = () => {
  const queryResult = useMarkets();

  const markets = Array.from(queryResult.data?.values() || []).filter(
    isMarketActive
  );

  return {
    ...queryResult,
    data: orderMarkets(markets),
  };
};

export const useProposedMarkets = () => {
  const queryResult = useMarkets();

  const markets = Array.from(queryResult.data?.values() || []).filter(
    isMarketProposed
  );

  return {
    ...queryResult,
    data: orderMarkets(markets),
  };
};

export const useClosedMarkets = () => {
  const queryResult = useMarkets();

  const markets = Array.from(queryResult.data?.values() || []).filter(
    isMarketClosed
  );

  return {
    ...queryResult,
    data: orderMarkets(markets),
  };
};

/*
 * Helpers
 */
const isMarketActive = (m: Market) => {
  if (!m.data) return false;
  return [
    MarketState.STATE_ACTIVE,
    MarketState.STATE_SUSPENDED,
    MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
    MarketState.STATE_PENDING,
  ].includes(m.data.marketState);
};

const isMarketProposed = (m: Market) => {
  if (!m.data) return false;
  return [MarketState.STATE_PROPOSED].includes(m.data.marketState);
};

const isMarketClosed = (m: Market) => {
  if (!m.data) return false;
  return [
    MarketState.STATE_SETTLED,
    MarketState.STATE_TRADING_TERMINATED,
    MarketState.STATE_CLOSED,
    MarketState.STATE_CANCELLED,
  ].includes(m.data.marketState);
};

const orderMarkets = (markets: Market[]) => {
  // TODO: Also order by trading mode
  return orderBy(markets, ['marketTimestamps.open', 'id'], ['asc', 'asc']);
};
