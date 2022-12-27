import type { StatisticsQuery } from './__generated__/Node';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const statisticsQuery = (
  override?: PartialDeep<StatisticsQuery>
): StatisticsQuery => {
  const defaultResult: StatisticsQuery = {
    statistics: {
      __typename: 'Statistics',
      chainId: 'chain-id',
      blockHeight: '11',
    },
  };

  return merge(defaultResult, override);
};
