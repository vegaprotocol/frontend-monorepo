import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimateOrderQuery } from '@vegaprotocol/deal-ticket';

const estimateOrderMock: EstimateOrderQuery = {
  estimateOrder: {
    __typename: 'OrderEstimate',
    totalFeeAmount: '0.0006',
    fee: {
      __typename: 'TradeFee',
      makerFee: '0.0001',
      infrastructureFee: '0.0002',
      liquidityFee: '0.0003',
    },
    marginLevels: { __typename: 'MarginLevels', initialLevel: '1' },
  },
};

export const generateEstimateOrder = (
  override?: PartialDeep<EstimateOrderQuery>
) => {
  return merge(estimateOrderMock, override);
};
