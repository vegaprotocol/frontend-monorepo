import { makeDataProvider } from '@vegaprotocol/data-provider';
import {
  MarketCandlesDocument,
  MarketCandlesUpdateDocument,
  type MarketCandlesQuery,
  type MarketCandlesQueryVariables,
  type MarketCandlesUpdateSubscription,
  type MarketCandlesFieldsFragment,
} from './__generated__/market-candles';

export type Candle = MarketCandlesFieldsFragment;

export const update = (data: Candle[] | null, delta: Candle) => {
  if (data && data.length) {
    if (data[data.length - 1].periodStart === delta.periodStart) {
      return [...data.slice(0, -1), delta];
    } else if (data[data.length - 1].periodStart < delta.periodStart) {
      return [...data, delta];
    } else {
      return data;
    }
  }
  return [delta];
};

const getData = (responseData: MarketCandlesQuery | null): Candle[] | null =>
  responseData?.marketsConnection?.edges[0]?.node.candlesConnection?.edges
    ?.filter((edge) => edge?.node)
    .map((edge) => edge?.node as Candle) || null;

const getDelta = (subscriptionData: MarketCandlesUpdateSubscription): Candle =>
  subscriptionData.candles;

export const marketCandlesProvider = makeDataProvider<
  MarketCandlesQuery,
  Candle[],
  MarketCandlesUpdateSubscription,
  Candle,
  MarketCandlesQueryVariables
>({
  query: MarketCandlesDocument,
  subscriptionQuery: MarketCandlesUpdateDocument,
  update,
  getData,
  getDelta,
});
