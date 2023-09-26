import { useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

import type { EstimateFeesQuery } from './__generated__/EstimateOrder';
import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

const divideByTwo = (n: string) => (BigInt(n) / BigInt(2)).toString();

export const useEstimateFees = (
  order?: OrderSubmissionBody['orderSubmission'],
  isMarketInAuction?: boolean
): EstimateFeesQuery['estimateFees'] | undefined => {
  const { pubKey } = useVegaWallet();
  const { data } = useEstimateFeesQuery({
    variables: order && {
      marketId: order.marketId,
      partyId: pubKey || '',
      price: order.price,
      size: order.size,
      side: order.side,
      timeInForce: order.timeInForce,
      type: order.type,
    },
    fetchPolicy: 'no-cache',
    skip: !pubKey || !order?.size || !order?.price || order.postOnly,
  });
  if (order?.postOnly) {
    return {
      totalFeeAmount: '0',
      fees: {
        infrastructureFee: '0',
        liquidityFee: '0',
        makerFee: '0',
      },
    };
  }
  return isMarketInAuction && data?.estimateFees
    ? {
        totalFeeAmount: divideByTwo(data.estimateFees.totalFeeAmount),
        fees: {
          infrastructureFee: divideByTwo(
            data.estimateFees.fees.infrastructureFee
          ),
          liquidityFee: divideByTwo(data.estimateFees.fees.liquidityFee),
          makerFee: divideByTwo(data.estimateFees.fees.makerFee),
        },
      }
    : data?.estimateFees;
};
