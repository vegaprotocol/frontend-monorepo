import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketCandlesQuery,
  MarketCandlesUpdateSubscription,
  MarketCandlesFieldsFragment,
} from './__generated___/market-candles';
import {
  MarketCandlesDocument,
  MarketCandlesUpdateDocument,
} from './__generated___/market-candles';

export type Candle = MarketCandlesFieldsFragment;

const update = (data: Candle[], delta: Candle) => {
  return data && delta ? [...data, delta] : data;
};

const getData = (responseData: MarketCandlesQuery): Candle[] | null =>
  responseData?.marketsConnection?.edges[0]?.node.candlesConnection?.edges
    ?.filter((edge) => edge?.node)
    .map((edge) => edge?.node as Candle) || null;

const getDelta = (subscriptionData: MarketCandlesUpdateSubscription): Candle =>
  subscriptionData.candles;

export const marketCandlesProvider = makeDataProvider<
  MarketCandlesQuery,
  Candle[],
  MarketCandlesUpdateSubscription,
  Candle
>({
  query: MarketCandlesDocument,
  subscriptionQuery: MarketCandlesUpdateDocument,
  update,
  getData,
  getDelta,
});
