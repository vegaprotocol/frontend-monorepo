import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import {
  MarketInfoDocument,
  type MarketInfoQuery,
  type MarketInfoQueryVariables,
} from './__generated__/MarketInfo';
import {
  marketDataProvider,
  type MarketData,
} from '../../market-data-provider';
import type { Candle } from '../../market-candles-provider';
import { useMemo } from 'react';

export type MarketInfo = NonNullable<MarketInfoQuery['market']>;
export type MarketInfoWithData = MarketInfo & { data?: MarketData };

export type MarketInfoWithDataAndCandles = MarketInfoWithData & {
  candles?: Candle[];
};

const getData = (responseData: MarketInfoQuery | null) =>
  responseData?.market || null;

export const marketInfoProvider = makeDataProvider<
  MarketInfoQuery,
  MarketInfoQuery['market'],
  never,
  never,
  MarketInfoQueryVariables
>({
  query: MarketInfoDocument,
  getData,
  errorPolicy: 'all',
  pollInterval: 5000,
});

export const marketInfoWithDataProvider = makeDerivedDataProvider<
  MarketInfoWithData,
  never,
  MarketInfoQueryVariables
>([marketInfoProvider, marketDataProvider], (parts) => {
  const market: MarketInfo | null = parts[0];
  const marketData: MarketData | null = parts[1];
  return (
    market && {
      ...market,
      data: marketData || undefined,
    }
  );
});

export const useMarketInfo = (marketId?: string) => {
  const variables = useMemo(() => ({ marketId: marketId || '' }), [marketId]);
  return useDataProvider({
    dataProvider: marketInfoProvider,
    variables,
    skip: !marketId,
  });
};
