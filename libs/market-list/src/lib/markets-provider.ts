import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import type {
  Markets,
  Markets_marketsConnection_edges_node,
} from './__generated__/Markets';
import { marketsDataProvider } from './markets-data-provider';
import { marketsCandlesProvider } from './markets-candles-provider';
import type { MarketData } from './market-data-provider';
import type { MarketCandles } from './markets-candles-provider';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

import type { MarketsCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node as Candle } from './__generated__/MarketsCandlesQuery';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type Market = Markets_marketsConnection_edges_node;

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketFields on Market {
    id
    decimalPlaces
    positionDecimalPlaces
    state
    tradingMode
    fees {
      factors {
        makerFee
        infrastructureFee
        liquidityFee
      }
    }
    tradableInstrument {
      instrument {
        id
        name
        code
        metadata {
          tags
        }
        product {
          ... on Future {
            settlementAsset {
              symbol
              decimals
            }
            quoteName
          }
        }
      }
    }
    marketTimestamps {
      open
      close
    }
  }
`;

export const MARKET_LIST_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query Markets {
    marketsConnection {
      edges {
        node {
          ...MarketFields
        }
      }
    }
  }
`;

const getData = (responseData: Markets): Market[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => edge.node) || null;

export const marketsProvider = makeDataProvider<
  Markets,
  Market[],
  never,
  never
>({
  query: MARKET_LIST_QUERY,
  getData,
  fetchPolicy: 'cache-first',
});

export const activeMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => mapDataToMarketList(markets)
);

export type MarketWithCandles = Market & { candles?: Candle[] };

const addCandles = <T extends Market>(
  markets: T[],
  marketsCandles: MarketCandles[]
) =>
  markets.map((market) => ({
    ...market,
    candles: marketsCandles.find((data) => data.marketId === market.id)
      ?.candles,
  }));

export const marketsWithCandlesProvider = makeDerivedDataProvider<
  MarketWithCandles[],
  never
>(
  [
    (callback, client) => activeMarketsProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) => addCandles(parts[0] as Market[], parts[1] as MarketCandles[])
);

export type MarketWithData = Market & { data?: MarketData };

const addData = <T extends Market>(markets: T[], marketsData: MarketData[]) =>
  markets.map((market) => ({
    ...market,
    data: marketsData.find((data) => data.market.id === market.id),
  }));

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[],
  never
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const marketListProvider = makeDerivedDataProvider<
  (MarketWithData & MarketWithCandles)[],
  never
>(
  [
    (callback, client) => marketsWithDataProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) =>
    addCandles(parts[0] as MarketWithCandles[], parts[1] as MarketCandles[])
);

export const useMarketList = () => {
  const variables = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return {
      since: new Date(yesterday * 1000).toISOString(),
      interval: Interval.INTERVAL_I1H,
    };
  }, []);
  const { data, loading, error } = useDataProvider({
    dataProvider: marketListProvider,
    variables,
    noUpdate: true,
  });

  return {
    data,
    loading,
    error,
  };
};
