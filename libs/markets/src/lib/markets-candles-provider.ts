import { makeDataProvider } from '@vegaprotocol/data-provider';
import {
  MarketsCandlesDocument,
  type MarketsCandlesQuery,
  type MarketsCandlesQueryVariables,
} from './__generated__/markets-candles';
import { type Candle } from './market-candles-provider';

export interface MarketCandles {
  marketId: string;
  candles: Candle[] | undefined;
}

const getData = (
  responseData: MarketsCandlesQuery | null
): MarketCandles[] | null =>
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
  never,
  MarketsCandlesQueryVariables
>({
  query: MarketsCandlesDocument,
  getData,
});
