import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataQuery,
  MarketDataEventSubscription,
  MarketDataFieldsFragment,
  MarketDataEventFieldsFragment,
} from './__generated__/MarketData';
import {
  MarketDataDocument,
  MarketDataEventDocument,
} from './__generated__/MarketData';

const update = (
  data: MarketDataFieldsFragment,
  delta: MarketDataEventFieldsFragment
) => {
  return produce(data, (draft) => {
    const { marketId, __typename, ...marketData } = delta;
    Object.assign(draft, marketData);
  });
};

const getData = (
  responseData: MarketDataQuery
): MarketDataFieldsFragment | null =>
  responseData?.marketsConnection?.edges[0].node.data || null;

const getDelta = (
  subscriptionData: MarketDataEventSubscription
): MarketDataEventFieldsFragment => subscriptionData.marketsData[0];

export const marketDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketDataFieldsFragment,
  MarketDataEventSubscription,
  MarketDataEventFieldsFragment
>({
  query: MarketDataDocument,
  subscriptionQuery: MarketDataEventDocument,
  update,
  getData,
  getDelta,
});
