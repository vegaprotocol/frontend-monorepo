import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  MarketsDataDocument,
  MarketDataEventDocument,
} from './__generated__/MarketData';
import type {
  MarketsDataQuery,
  MarketDataEventSubscription,
  MarketDataFieldsFragment,
} from './__generated__/MarketData';

const update = (
  data: MarketDataFieldsFragment,
  delta: MarketDataFieldsFragment
) => {
  return produce(data, (draft) => {
    const { __typename, ...marketData } = delta;
    Object.assign(draft, marketData);
  });
};

const getData = (
  responseData: MarketsDataQuery
): MarketDataFieldsFragment | null =>
  responseData.marketsConnection.edges[0].node.data || null;

const getDelta = (
  subscriptionData: MarketDataEventSubscription
): MarketDataFieldsFragment => subscriptionData.marketData;

export const marketDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketDataFieldsFragment,
  MarketDataEventSubscription,
  MarketDataFieldsFragment
>({
  query: MarketsDataDocument,
  subscriptionQuery: MarketDataEventDocument,
  update,
  getData,
  getDelta,
});
