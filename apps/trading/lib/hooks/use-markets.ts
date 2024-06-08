import { useEffect } from 'react';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApolloClient } from '@apollo/client';
import {
  MarketsV2Document,
  type MarketFieldsV2Fragment,
  type MarketsV2Query,
  type MarketsV2QueryVariables,
  type SpotV2Fragment,
  type FutureV2Fragment,
  type PerpetualV2Fragment,
  type CandleV2Fragment,
  MarketDataV2Document,
  type MarketDataV2Subscription,
  type MarketDataV2SubscriptionVariables,
} from './__generated__/Markets';
import { MarketState } from '@vegaprotocol/types';
import { MIN, toBigNum } from '@vegaprotocol/utils';
import { subDays } from 'date-fns';
import BigNumber from 'bignumber.js';

export type Market = MarketFieldsV2Fragment;
type MarketLookup = Map<string, Market>;

const since = subDays(new Date(), 1).toISOString();

export const useMarkets = () => {
  const queryClient = useQueryClient();
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

  useEffect(() => {
    if (!queryResult.data) return;

    const activeMarketIds = Array.from(queryResult.data.values())
      .filter(isMarketActive)
      .map((m) => m.id);

    // There are no active markets, no need to subscribe
    if (!activeMarketIds.length) return;

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
  }, [client, queryClient, queryResult.data]);

  return queryResult;
};

export const useMarket = ({ marketId = '' }: { marketId?: string }) => {
  const queryResult = useMarkets();
  const market = queryResult.data?.get(marketId);
  return {
    ...queryResult,
    data: market,
  };
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

export const getProductType = (market: Market) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error(
      'Failed to retrieve product type. Invalid tradable instrument'
    );
  }

  const type = market.tradableInstrument.instrument.product.__typename;

  if (!type) {
    throw new Error('Failed to retrieve asset. Invalid product type');
  }

  return type;
};

export const getQuoteName = (market: Market) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error(
      'Failed to retrieve quoteName. Invalid tradable instrument'
    );
  }

  const { product } = market.tradableInstrument.instrument;

  if (isPerpetual(product) || isFuture(product)) {
    return product.quoteName;
  }

  if (isSpot(product)) {
    return product.quoteAsset.symbol;
  }

  throw new Error('Failed to retrieve quoteName. Invalid product type');
};

export const getAsset = (market: Market) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const { product } = market.tradableInstrument.instrument;

  if (isPerpetual(product) || isFuture(product)) {
    return product.settlementAsset;
  }

  if (isSpot(product)) {
    return product.quoteAsset;
  }

  throw new Error('Failed to retrieve asset. Invalid product type');
};

export const getBaseAsset = (market: Market) => {
  if (!market.tradableInstrument.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const product = market.tradableInstrument.instrument.product;

  if (isSpot(product)) {
    return product.baseAsset;
  }

  throw new Error(
    `Failed to retrieve base asset. Invalid product type ${product.__typename}`
  );
};

export const getQuoteAsset = (market: Market) => {
  if (!market.tradableInstrument.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const { product } = market.tradableInstrument.instrument;

  if (isSpot(product)) {
    return product.quoteAsset;
  }

  throw new Error(
    `Failed to retrieve quote asset. Invalid product type ${product.__typename}`
  );
};

type Product = Market['tradableInstrument']['instrument']['product'];

export const isSpot = (product: Product): product is SpotV2Fragment =>
  product.__typename === 'Spot';

export const isFuture = (product: Product): product is FutureV2Fragment =>
  product.__typename === 'Future';

export const isPerpetual = (product: Product): product is PerpetualV2Fragment =>
  product.__typename === 'Perpetual';

export const calcCandleVolume = (
  candles: CandleV2Fragment[]
): string | undefined =>
  candles &&
  candles.reduce((acc, c) => new BigNumber(acc).plus(c.volume).toString(), '0');

export const calcTradedFactor = (m: Market) => {
  const candleData = compact(
    (m.candlesConnection?.edges || []).map((e) => e?.node)
  );
  const volume = Number(calcCandleVolume(candleData) || 0);
  const price = m.data?.markPrice ? Number(m.data.markPrice) : 0;
  const asset = getAsset(m);
  const quantum = Number(asset.quantum);
  const decimals = Number(asset.decimals);
  const fp = toBigNum(price, decimals);
  const fq = toBigNum(quantum, decimals);
  const factor = fq.multipliedBy(fp).multipliedBy(volume);
  return factor.toNumber();
};
