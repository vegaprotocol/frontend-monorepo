import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  MarketCandlesDocument,
  MarketCandlesEventDocument,
} from './__generated__/MarketCandles';
import type {
  MarketCandlesQuery,
  MarketCandlesEventSubscription,
  MarketCandleFieldsFragment,
  MarketCandleEventFieldsFragment,
} from './__generated__/MarketCandles';

const update = (data: MarketCandleFieldsFragment[], delta: MarketCandleEventFieldsFragment) => {
  return data && delta
    ? [
        ...data,
        {
          ...delta,
          __typename: 'CandleNode',
        } as MarketCandleFieldsFragment,
      ]
    : data;
};

const getData = (responseData: MarketCandlesQuery): MarketCandleFieldsFragment[] | null =>
  responseData.marketsConnection.edges[0].node.candlesConnection.edges
    ?.filter((edge) => edge?.node)
    .map((edge) => edge?.node as MarketCandleFieldsFragment) || null;

const getDelta = (
  subscriptionData: MarketCandlesEventSubscription
): MarketCandleEventFieldsFragment => subscriptionData.candles;

export const marketCandlesProvider = makeDataProvider<
  MarketCandlesQuery,
  MarketCandleFieldsFragment[],
  MarketCandlesEventSubscription,
  MarketCandleEventFieldsFragment
>({
  query: MarketCandlesDocument,
  subscriptionQuery: MarketCandlesEventDocument,
  update,
  getData,
  getDelta,
});
