import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import type {
  Markets,
  Markets_marketsConnection_edges_node,
} from './__generated__';
import { marketsDataProvider } from './markets-data-provider';
import { marketsCandlesProvider } from './markets-candles-provider';
import type { MarketData } from './market-data-provider';
import type { MarketCandles } from './markets-candles-provider';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

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
  responseData.marketsConnection.edges.map((edge) => edge.node);

export const marketsProvider = makeDataProvider<
  Markets,
  Market[],
  never,
  never
>({
  query: MARKET_LIST_QUERY,
  getData,
});

export const activeMarketsProvider = makeDerivedDataProvider<Market[]>(
  [marketsProvider],
  ([markets]) => mapDataToMarketList(markets)
);

export interface MarketsListData {
  markets: Market[];
  marketsData: MarketData[];
  marketsCandles: MarketCandles[];
}

export const marketListProvider = makeDerivedDataProvider<MarketsListData>(
  [
    (callback, client) => activeMarketsProvider(callback, client),
    (callback, client) => marketsDataProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) => {
    return {
      markets: parts[0] as Market[],
      marketsData: parts[1] as MarketData[],
      marketsCandles: parts[2] as MarketCandles[],
    };
  }
);

export type MarketWithData = Market & { data?: MarketData };

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[]
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  (parts[0] as Market[]).map((market) => ({
    ...market,
    data: (parts[1] as MarketData[]).find(
      (data) => data.market.id === market.id
    ),
  }))
);

export const useMarketList = () => {
  const variables = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return {
      since: new Date(yesterday * 1000).toISOString(),
      interval: Interval.INTERVAL_I1H,
    };
  }, []);
  const { data, loading, error } = useDataProvider<MarketsListData, never>({
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
