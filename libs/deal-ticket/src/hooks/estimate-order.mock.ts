import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimateFeesQuery } from './__generated__/EstimateOrder';

export const estimateFeesQuery = (
  override?: PartialDeep<EstimateFeesQuery>
): EstimateFeesQuery => {
  const defaultResult: EstimateFeesQuery = {
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
