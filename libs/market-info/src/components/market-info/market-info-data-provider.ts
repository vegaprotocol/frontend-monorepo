import { makeDataProvider, makeDerivedDataProvider } from '@vegaprotocol/utils';
import type {
  MarketInfoQuery,
  MarketInfoQueryVariables,
} from './__generated__/MarketInfo';
import {
  marketDataProvider,
  marketCandlesProvider,
} from '@vegaprotocol/market-list';
import type {
  MarketData,
  Candle,
  MarketCandlesQueryVariables,
} from '@vegaprotocol/market-list';
import { MarketInfoDocument } from './__generated__/MarketInfo';

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

export const marketInfoWithDataAndCandlesProvider = makeDerivedDataProvider<
  MarketInfoWithDataAndCandles,
  never,
  MarketCandlesQueryVariables
>([marketInfoProvider, marketDataProvider, marketCandlesProvider], (parts) => {
  const market: MarketInfo | null = parts[0];
  const marketData: MarketData | null = parts[1];
  const candles: Candle[] | null = parts[2];
  return (
    market && {
      ...market,
      data: marketData || undefined,
      candles: candles || undefined,
    }
  );
});
