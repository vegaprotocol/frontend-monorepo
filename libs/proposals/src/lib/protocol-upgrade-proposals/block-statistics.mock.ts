import type { BlockStatisticsQuery } from './__generated__/BlockStatistics';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const blockStatisticsQuery = (
  override?: PartialDeep<BlockStatisticsQuery>
): BlockStatisticsQuery => {
  const defaultResult = {
    statistics: {
      __typename: 'Statistics',
      blockHeight: '100',
      blockDuration: '100',
    },
  };

  return merge(defaultResult, override);
};
