import { useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

import type { EstimateFeesQuery } from './__generated__/EstimateOrder';
import { useEstimateFeesQuery } from './__generated__/EstimateOrder';

const divideByTwo = (n: string) => (BigInt(n) / BigInt(2)).toString();

export const useEstimateFees = (
  order?: OrderSubmissionBody['orderSubmission'],
  isMarketInAuction?: boolean
):
  | (EstimateFeesQuery['estimateFees'] & {
      referralDiscountFactor: string;
      volumeDiscountFactor: string;
    })
  | undefined => {
  const { pubKey } = useVegaWallet();
  const {
    data: currentData,
    previousData,
    loading,
  } = useEstimateFeesQuery({
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
  const data = loading ? currentData || previousData : currentData;
  const volumeDiscountFactor =
    (data?.volumeDiscountStats.edges[0]?.node.atEpoch.toString() ===
      data?.epoch.id &&
      data?.volumeDiscountStats.edges[0]?.node.discountFactor) ||
    '0';
  const referralDiscountFactor =
    (data?.referralSetStats.edges[0]?.node.atEpoch.toString() ===
      data?.epoch.id &&
      data?.referralSetStats.edges[0]?.node.discountFactor) ||
    '0';
  if (order?.postOnly) {
    return {
      volumeDiscountFactor,
      referralDiscountFactor,
      totalFeeAmount: '0',
      fees: {
        infrastructureFee: '0',
        liquidityFee: '0',
        makerFee: '0',
      },
    };
  }
  if (!data?.estimateFees) {
    return undefined;
  }
  return isMarketInAuction
    ? {
        volumeDiscountFactor,
        referralDiscountFactor,
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
    : {
        volumeDiscountFactor,
        referralDiscountFactor,
        ...data.estimateFees,
      };
};
