import type { StatisticsQuery } from '@vegaprotocol/environment';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateStatistics = (
  override?: PartialDeep<StatisticsQuery>
): StatisticsQuery => {
  const defaultResult = {
    statistics: {
      __typename: 'Statistics',
      chainId: Cypress.env('VEGA_ENV').toLowerCase() || 'test-chain-id',
      blockHeight: '11',
    },
  };

  return merge(defaultResult, override);
};
