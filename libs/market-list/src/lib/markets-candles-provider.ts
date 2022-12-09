import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { MarketsCandlesDocument } from './__generated__/markets-candles';
import type { MarketsCandlesQuery } from './__generated__/markets-candles';
import type { Candle } from './market-candles-provider';

export interface MarketCandles {
  marketId: string;
  candles: Candle[] | undefined;
}

const getData = (responseData: MarketsCandlesQuery): MarketCandles[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => ({
    marketId: edge.node.id,
    candles: edge.node.candlesConnection?.edges
      ?.filter((edge) => edge?.node)
      .map((edge) => edge?.node as Candle),
  })) || null;

export const marketsCandlesProvider = makeDataProvider<
  MarketsCandlesQuery,
  MarketCandles[],
  never,
  never
>({
  query: MarketsCandlesDocument,
  getData,
});
