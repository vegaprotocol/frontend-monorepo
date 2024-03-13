import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import { ENV, Networks } from '@vegaprotocol/environment';
import {
  MarketInfoDocument,
  MarketInfoMainnetDocument,
  type MarketInfoQuery,
  type MarketInfoQueryVariables,
} from './__generated__/MarketInfo';
import {
  marketDataProvider,
  type MarketData,
} from '../../market-data-provider';
import type { Candle } from '../../market-candles-provider';

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
  query:
    // Mainnet does not support tickSize, and a query for tickSize on a market will completely fail
    ENV.VEGA_ENV === Networks.MAINNET
      ? MarketInfoMainnetDocument
      : MarketInfoDocument,
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
