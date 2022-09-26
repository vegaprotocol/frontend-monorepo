import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';

import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import type {
  Markets,
  Markets_marketsConnection_edges_node,
} from '@vegaprotocol/market-list';
import { mapDataToMarketList } from '@vegaprotocol/market-list';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type Market = Markets_marketsConnection_edges_node;

export const MARKET_LIST_QUERY = gql`
  query MarketsLiquidityCandles($interval: Interval!, $since: String!) {
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

export interface MarketsListData {
  markets: Market[];
}

export const liquidityProvisionProvider = makeDerivedDataProvider<
  MarketsListData,
  never
>(
  [
    (callback, client, variables) =>
      activeMarketsProvider(callback, client, variables),
  ],
  (parts) => {
    return {
      markets: parts[0] as Market[],
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
