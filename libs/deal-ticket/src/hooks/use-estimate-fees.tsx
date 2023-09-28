import { useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

import type { EstimateFeesQuery } from './__generated__/EstimateOrder';
import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

const divideByTwo = (n: string) => (BigInt(n) / BigInt(2)).toString();
export const sumFeesDiscounts = (
  fees: EstimateFeesQuery['estimateFees']['fees']
) => {
  const volume = (
    BigInt(fees.makerFeeVolumeDiscount || '0') +
    BigInt(fees.infrastructureFeeVolumeDiscount || '0') +
    BigInt(fees.liquidityFeeVolumeDiscount || '0')
  ).toString();
  const referral = (
    BigInt(fees.makerFeeReferralDiscount || '0') +
    BigInt(fees.infrastructureFeeReferralDiscount || '0') +
    BigInt(fees.liquidityFeeReferralDiscount || '0')
  ).toString();
  return {
    volume,
    referral,
    total: (BigInt(volume) + BigInt(referral)).toString(),
  };
};

export const sumFees = (fees: EstimateFeesQuery['estimateFees']['fees']) =>
  (
    BigInt(fees.makerFee || '0') +
    BigInt(fees.infrastructureFee || '0') +
    BigInt(fees.liquidityFee || '0')
  ).toString();

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
          infrastructureFeeReferralDiscount:
            data.estimateFees.fees.infrastructureFeeReferralDiscount &&
            divideByTwo(
              data.estimateFees.fees.infrastructureFeeReferralDiscount
            ),
          infrastructureFeeVolumeDiscount:
            data.estimateFees.fees.infrastructureFeeVolumeDiscount &&
            divideByTwo(data.estimateFees.fees.infrastructureFeeVolumeDiscount),
          liquidityFeeReferralDiscount:
            data.estimateFees.fees.liquidityFeeReferralDiscount &&
            divideByTwo(data.estimateFees.fees.liquidityFeeReferralDiscount),
          liquidityFeeVolumeDiscount:
            data.estimateFees.fees.liquidityFeeVolumeDiscount &&
            divideByTwo(data.estimateFees.fees.liquidityFeeVolumeDiscount),
          makerFeeReferralDiscount:
            data.estimateFees.fees.makerFeeReferralDiscount &&
            divideByTwo(data.estimateFees.fees.makerFeeReferralDiscount),
          makerFeeVolumeDiscount:
            data.estimateFees.fees.makerFeeVolumeDiscount &&
            divideByTwo(data.estimateFees.fees.makerFeeVolumeDiscount),
        },
      }
    : data?.estimateFees;
};
