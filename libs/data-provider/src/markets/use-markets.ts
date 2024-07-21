import { useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  MarketsV2Document,
  type MarketFieldsV2Fragment,
  type MarketsV2Query,
  type MarketsV2QueryVariables,
  MarketDataV2Document,
  type MarketDataV2Subscription,
  type MarketDataV2SubscriptionVariables,
} from './__generated__/Markets';
import { MIN } from '@vegaprotocol/utils';
import { subDays } from 'date-fns';
import { isMarketActive } from './utils';

export type Market = MarketFieldsV2Fragment;
export type Product = Market['tradableInstrument']['instrument']['product'];
export type MarketLookup = Map<string, Market>;

const since = subDays(new Date(), 1).toISOString();

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
        variables: {
          since,
        },
        fetchPolicy: 'no-cache',
      });

      const markets: MarketLookup = new Map();

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

/** Called in data-loader once to connect all active markets */
export const useMarketsSubscription = () => {
  const ids = useRef<string[] | null>(null);
  const queryClient = useQueryClient();
  const client = useApolloClient();
  const { data } = useMarkets();

  const activeMarketIds = Array.from(data?.values() || [])
    .filter(isMarketActive)
    .map((m) => m.id)
    .sort();

  useEffect(() => {
    // There are no active markets, no need to subscribe
    if (!activeMarketIds.length) return;
    if (isEqual(activeMarketIds, ids.current)) return;

    ids.current = activeMarketIds;

    const sub = client
      .subscribe<MarketDataV2Subscription, MarketDataV2SubscriptionVariables>({
        query: MarketDataV2Document,
        fetchPolicy: 'no-cache',
        variables: { marketIds: activeMarketIds },
      })
      .subscribe(({ data }) => {
        queryClient.setQueryData(['markets'], (curr: MarketLookup) => {
          if (!data) return;
          if (!curr) return curr;

          const markets = new Map();

          for (const m of curr) {
            const [marketId, market] = m;

            const update = data.marketsData.find(
              (d) => d.marketId === marketId
            );

            markets.set(marketId, {
              ...market,
              data: update,
            });
          }

          return markets;
        });
      });

    return () => {
      sub.unsubscribe();
    };
  }, [client, queryClient, activeMarketIds]);
};

export const useMarket = ({ marketId = '' }: { marketId?: string }) => {
  const queryResult = useMarkets();
  const market = queryResult.data?.get(marketId);
  return {
    ...queryResult,
    data: market,
  };
};
