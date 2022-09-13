import produce from 'immer';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  useMarketListQuery,
  MarketListDocument,
  MarketDataEventDocument,
} from './__generated__/MarketData';
import type {
  MarketListQuery,
  MarketListItemFragment,
  MarketDataFieldsFragment,
  MarketDataEventSubscription,
} from './__generated__/MarketData';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

export const useMarketList = () => {
  const since = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const { data, loading, error } = useMarketListQuery({
    variables: { interval: Interval.INTERVAL_I1H, since },
  });

  return {
    data: useMemo(() => data && mapDataToMarketList(data), [data]),
    loading,
    error,
  };
};

const update = (
  data: MarketListItemFragment[],
  delta: MarketDataFieldsFragment
) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.id === delta.market.id);
    if (index !== -1) {
      draft[index].data = delta;
    }
    // @TODO - else push new market to draft
  });
};

const getData = (
  responseData: MarketListQuery
): MarketListItemFragment[] | null => responseData?.markets || null;

const getDelta = (
  subscriptionData: MarketDataEventSubscription
): MarketDataFieldsFragment => subscriptionData.marketData;

export const marketsDataProvider = makeDataProvider<
  MarketListQuery,
  MarketListItemFragment[],
  MarketDataEventSubscription,
  MarketDataFieldsFragment
>({
  query: MarketListDocument,
  subscriptionQuery: MarketDataEventDocument,
  update,
  getData,
  getDelta,
});
