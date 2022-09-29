import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  MarketDataDocument,
  MarketDataUpdateDocument,
} from './__generated___/market-data';
import type {
  MarketDataQuery,
  MarketDataFieldsFragment,
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment,
} from './__generated___/market-data';

export type MarketData = MarketDataFieldsFragment;

const update = (data: MarketData, delta: MarketDataUpdateFieldsFragment) => {
  return produce(data, (draft) => {
    const { marketId, __typename, ...marketData } = delta;
    Object.assign(draft, marketData);
  });
};

const getData = (responseData: MarketDataQuery): MarketData | null =>
  responseData?.marketsConnection?.edges[0].node.data || null;

const getDelta = (
  subscriptionData: MarketDataUpdateSubscription
): MarketDataUpdateFieldsFragment => subscriptionData.marketsData[0];

export const marketDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketData,
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment
>({
  query: MarketDataDocument,
  subscriptionQuery: MarketDataUpdateDocument,
  update,
  getData,
  getDelta,
});
