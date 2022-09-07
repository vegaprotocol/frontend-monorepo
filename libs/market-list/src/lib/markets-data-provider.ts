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
import { marketsDataDataProvider, marketsCandlesDataProvider } from './';
import type { MarketData, MarketCandles } from './';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type Market = Markets_marketsConnection_edges_node;

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketFields on Market {
    id
    name
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

export const marketsDataProvider = makeDataProvider<
  Markets,
  Market[],
  never,
  never
>({
  query: MARKET_LIST_QUERY,
  getData,
});

export const activeMarketsDataProvider = makeDerivedDataProvider<Market[]>(
  [marketsDataProvider],
  ([markets]) => mapDataToMarketList(markets)
);

interface MarketsListData {
  markets: Market[];
  marketsData: MarketData[];
  marketsCandles: MarketCandles[];
}

export const marketListDataProvider = makeDerivedDataProvider<MarketsListData>(
  [
    (callback, client) => activeMarketsDataProvider(callback, client),
    (callback, client) => marketsDataDataProvider(callback, client),
    marketsCandlesDataProvider,
  ],
  (parts) => {
    return {
      markets: parts[0] as Market[],
      marketsData: parts[1] as MarketData[],
      marketsCandles: parts[3] as MarketCandles[],
    };
  }
);

export type MarketWithData = Market & { data?: MarketData };

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[]
>([activeMarketsDataProvider, marketsDataDataProvider], (parts) =>
  (parts[0] as Market[]).map((market) => ({
    ...market,
    data: (parts[1] as MarketData[]).find(
      (data) => data.market.id === market.id
    ),
  }))
);

export const useMarketList = () => {
  const since = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const { data, loading, error } = useDataProvider<MarketsListData, never>({
    dataProvider: marketListDataProvider,
    variables: { interval: Interval.INTERVAL_I1H, since },
    update: () => true,
  });

  return {
    data,
    loading,
    error,
  };
};
