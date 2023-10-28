import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

export const estimateFeesQuery = (
  override?: PartialDeep<EstimateFeesQuery>
): EstimateFeesQuery => {
  const defaultResult: EstimateFeesQuery = {
    epoch: {
      id: '1',
    },
    referralSetStats: {
      edges: [],
    },
    volumeDiscountStats: {
      edges: [],
    },
    estimateFees: {
      __typename: 'FeeEstimate',
      totalFeeAmount: '0.0006',
      fees: {
        __typename: 'TradeFee',
        makerFee: '100000',
        infrastructureFee: '100000',
        liquidityFee: '100000',
      },
    },
  };
  return merge(defaultResult, override);
};
