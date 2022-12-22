import type { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
import type { EstimateOrderQuery } from './__generated__/EstimateOrder';

export const estimateOrderQuery = (
  override?: PartialDeep<EstimateOrderQuery>
): EstimateOrderQuery => {
  const defaultResult: EstimateOrderQuery = {
    estimateOrder: {
      __typename: 'OrderEstimate',
      totalFeeAmount: '0.0006',
      fee: {
        __typename: 'TradeFee',
        makerFee: '100000',
        infrastructureFee: '100000',
        liquidityFee: '100000',
      },
      marginLevels: { __typename: 'MarginLevels', initialLevel: '1' },
    },
  };
  return merge(defaultResult, override);
};

// export const estimateOrderQuery = (
//   override?: PartialDeep<EstimateOrderQuery>
// ): EstimateOrderQuery => {
//   const defaultResult: EstimateOrderQuery = {
//     estimateOrder: {
//       __typename: 'OrderEstimate',
//       totalFeeAmount: '0.0006',
//       fee: {
//         __typename: 'TradeFee',
//         makerFee: '0.0001',
//         infrastructureFee: '0.0002',
//         liquidityFee: '0.0003',
//       },
//       marginLevels: { __typename: 'MarginLevels', initialLevel: '1' },
//     },
//   };
//   return merge(defaultResult, override);
// };
