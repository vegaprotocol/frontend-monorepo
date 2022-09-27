import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { MarketsCandlesDocument } from './__generated__/MarketCandles';
import type {
  MarketsCandlesQuery,
  MarketCandleFieldsFragment,
  MarketsCandlesNodeFieldsFragment,
} from './__generated__/MarketCandles';

export interface MarketCandles {
  marketId: MarketsCandlesNodeFieldsFragment['id'];
  candles: MarketCandleFieldsFragment[] | undefined;
}

const getData = (responseData: MarketsCandlesQuery): MarketCandles[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => ({
    marketId: edge.node.id,
    candles: edge.node.candlesConnection?.edges
      ?.filter((edge) => edge?.node)
      .map((edge) => edge?.node as MarketCandleFieldsFragment),
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
