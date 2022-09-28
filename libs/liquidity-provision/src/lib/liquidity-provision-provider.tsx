import { useMemo } from 'react';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import type { MarketCandles } from '@vegaprotocol/market-list';
import { marketsCandlesProvider } from '@vegaprotocol/market-list';

import type {
  LiquidityProvisionMarkets as Markets,
  LiquidityProvisionMarkets_marketsConnection_edges_node as Market,
} from './__generated__';

import type { MarketsListData } from './utils';
import { mapDataToMarketList } from './utils';

export const MARKET_LIST_QUERY = gql`
  query LiquidityProvisionMarkets($interval: Interval!, $since: String!) {
    marketsConnection {
      edges {
        node {
          id
          decimalPlaces
          positionDecimalPlaces
          state
          tradingMode
          tradableInstrument {
            instrument {
              name
              code
              product {
                ... on Future {
                  settlementAsset {
                    symbol
                    decimals
                  }
                }
              }
            }
          }
          liquidityProvisionsConnection {
            edges {
              node {
                commitmentAmount
              }
            }
          }
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

const getData = (responseData: Markets): Market[] | null => {
  return (
    responseData?.marketsConnection?.edges.map((edge) => {
      return edge.node;
    }) || null
  );
};

const marketsProvider = makeDataProvider<Markets, Market[], never, never>({
  query: MARKET_LIST_QUERY,
  getData,
});

const activeMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => mapDataToMarketList(markets)
);

export const liquidityProvisionProvider = makeDerivedDataProvider<
  MarketsListData,
  never
>(
  [
    (callback, client, variables) =>
      activeMarketsProvider(callback, client, variables),
    (callback, client, variables) =>
      marketsCandlesProvider(callback, client, {
        ...variables,
        interval: Interval.INTERVAL_I1D,
      }),
  ],
  (parts) => {
    return {
      markets: parts[0] as Market[],
      marketsCandles24hAgo: parts[1] as MarketCandles[],
    };
  }
);

export const useLiquidityProvision = () => {
  const variables = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return {
      since: new Date(yesterday * 1000).toISOString(),
      interval: Interval.INTERVAL_I1H,
    };
  }, []);

  const { data, loading, error } = useDataProvider<MarketsListData, never>({
    dataProvider: liquidityProvisionProvider,
    variables,
    noUpdate: true,
  });

  return {
    data,
    loading,
    error,
  };
};
