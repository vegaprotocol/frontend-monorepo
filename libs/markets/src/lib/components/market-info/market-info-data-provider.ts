import {
  makeDataProvider,
  makeDerivedDataProvider,
  marketDataErrorPolicyGuard,
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
  errorPolicyGuard: marketDataErrorPolicyGuard,
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

export const maxLeverageProvider = makeDerivedDataProvider<
  number,
  never,
  MarketInfoQueryVariables
>([marketInfoProvider], (parts) => {
  const market: MarketInfo | null = parts[0];
  return (
    1 /
    Math.max(
      Number(market?.riskFactors?.long),
      Number(market?.riskFactors?.short)
    )
  );
});

export const useMaxLeverage = (marketId?: string) => {
  return useDataProvider({
    dataProvider: maxLeverageProvider,
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });
};
