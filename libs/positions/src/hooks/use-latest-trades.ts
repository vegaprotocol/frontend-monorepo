import orderBy from 'lodash/orderBy';
import omit from 'lodash/omit';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import {
  type LatestTradeFieldsFragment,
  LatestTradesDocument,
  type LatestTradesQuery,
  LatestTradesUpdateDocument,
  type LatestTradesUpdateSubscription,
  LatestTradesQueryVariables,
  LatestTradesUpdateSubscriptionVariables,
} from '../lib/__generated__/LatestTrades';
import { makeDataProvider, useDataProvider } from '@vegaprotocol/data-provider';

type LatestTrades = Omit<LatestTradeFieldsFragment, '__typename'>;

export const useLatestTrades = (marketIds: string[], partyIds: string[]) => {
  const { data, loading, error } = useDataProvider({
    dataProvider: latestTradesDataProvider,
    variables: { marketIds, partyIds },
    skip: marketIds.length === 0 || partyIds.length === 0,
  });

  return { data, loading, error };
};

const MAX_TRADES = 500;

const getData = (responseData: LatestTradesQuery | null): LatestTrades[] =>
  orderBy(
    omit(removePaginationWrapper(responseData?.trades?.edges), '__typename'),
    'createdAt',
    'desc'
  ) || [];

const getDelta = (
  subscriptionData: LatestTradesUpdateSubscription
): LatestTrades[] =>
  subscriptionData?.tradesStream?.map((ts) => omit(ts, '__typename')) || [];

const update = (
  data: LatestTrades[] | null,
  delta: ReturnType<typeof getDelta>
): LatestTrades[] => {
  const updatedData = data ? [...data] : ([] as LatestTradeFieldsFragment[]);
  orderBy(delta, 'createdAt', 'desc').forEach((tradeUpdate) => {
    const index = data?.findIndex((trade) => trade.id === tradeUpdate.id) ?? -1;
    if (index !== -1) {
      updatedData[index] = {
        ...updatedData[index],
      };
    } else if (!data?.length || tradeUpdate.createdAt >= data[0].createdAt) {
      updatedData.unshift(omit(tradeUpdate, '__typename') as LatestTrades);
    }
  });
  return updatedData.slice(0, MAX_TRADES);
};

const latestTradesDataProvider = makeDataProvider<
  LatestTradesQuery,
  LatestTrades[],
  LatestTradesUpdateSubscription,
  LatestTrades[],
  LatestTradesQueryVariables,
  LatestTradesUpdateSubscriptionVariables
>({
  query: LatestTradesDocument,
  subscriptionQuery: LatestTradesUpdateDocument,
  update: (data, delta) => update(data, delta),
  getData,
  getDelta,
  pagination: undefined,
  fetchPolicy: 'no-cache',
  getSubscriptionVariables: ({ marketIds, partyIds }) => ({
    marketIds,
    partyIds,
  }),
});
