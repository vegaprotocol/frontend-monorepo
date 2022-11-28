import type { StatisticsQuery } from '@vegaprotocol/environment';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateStatistics = (
  override?: PartialDeep<StatisticsQuery>
): StatisticsQuery => {
  const defaultResult = {
    statistics: {
      __typename: 'Statistics',
      // this needs to match the network set up for vegawallet-dummy in .github/actions/setup-vegawallet/action.yml
      chainId: 'stagnet3',
      blockHeight: '11',
    },
  };

  return merge(defaultResult, override);
};
