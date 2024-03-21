import orderBy from 'lodash/orderBy';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useLatestTradesQuery } from '../lib/__generated__/LatestTrades';

export const useLatestTrades = (marketIds: string[], partyIds: string[]) => {
  const { data, loading, error } = useLatestTradesQuery({
    variables: {
      marketIds,
      partyIds,
    },
    skip: marketIds.length === 0 || partyIds.length === 0,
  });
  const latestTrades = orderBy(
    removePaginationWrapper(data?.trades?.edges).map((tr) => ({
      ...tr,
      createdAt: new Date(tr.createdAt),
    })),
    'createdAt',
    'desc'
  );

  return { data: latestTrades, loading, error };
};
