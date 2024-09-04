import { isMarketInAuction } from '@vegaprotocol/markets';

import { useEstimateFeesQuery } from '../__generated__/EstimateFees';
import BigNumber from 'bignumber.js';
import { useEstimateFeesVariables } from './use-estimate-fees-variables';
import { type MarketTradingMode } from '@vegaprotocol/types';
import { type FormFields } from '../schemas';

export type UseEstimateFeesArgs = {
  useOcoFields: boolean;
  partyId: string | undefined;
  marketTradingMode: MarketTradingMode | null | undefined;
  markPrice: string | null;
  values: FormFields;
  market: {
    id: string;
    decimalPlaces: number;
    positionDecimalPlaces: number;
  };
};

export const useEstimateFees = (args: UseEstimateFeesArgs) => {
  const variables = useEstimateFeesVariables(args);
  const { data } = useEstimateFeesQuery({
    variables,
    skip:
      args.values.postOnly ||
      !variables.partyId ||
      !variables.size ||
      !variables.price,
    fetchPolicy: 'cache-and-network',
  });

  const isAuction = args.marketTradingMode
    ? isMarketInAuction(args.marketTradingMode)
    : false;

  // Post only orders won't have fees as its the taker who pays
  if (!data || args.values.postOnly) {
    return {
      fee: BigNumber(0),
      feeDiscounted: BigNumber(0),
      discount: BigNumber(0),
      discountPct: BigNumber(0),
      makerRebate: BigNumber(0),
      makerRebatePct: BigNumber(0),
    };
  }

  const fees = {
    makerFee: data?.estimateFees.fees.makerFee || '0',
    infrastructureFee: data?.estimateFees.fees.infrastructureFee || '0',
    liquidityFee: data?.estimateFees.fees.liquidityFee || '0',
    buyBackFee: data?.estimateFees.fees.buyBackFee || '0',
    treasuryFee: data?.estimateFees.fees.treasuryFee || '0',
    highVolumeMakerFee: data?.estimateFees.fees.highVolumeMakerFee || '0',
  };

  const discounts = {
    makerFeeReferralDiscount:
      data?.estimateFees.fees.makerFeeReferralDiscount || '0',
    makerFeeVolumeDiscount:
      data?.estimateFees.fees.makerFeeVolumeDiscount || '0',
    infrastructureFeeReferralDiscount:
      data?.estimateFees.fees.infrastructureFeeReferralDiscount || '0',
    infrastructureFeeVolumeDiscount:
      data?.estimateFees.fees.infrastructureFeeVolumeDiscount || '0',
    liquidityFeeReferralDiscount:
      data?.estimateFees.fees.liquidityFeeReferralDiscount || '0',
    liquidityFeeVolumeDiscount:
      data?.estimateFees.fees.liquidityFeeVolumeDiscount || '0',
  };

  let feeDiscounted = BigNumber.sum.apply(
    null,
    Object.values(fees).map((v) => BigNumber(v))
  );
  let discount = BigNumber.sum.apply(
    null,
    Object.values(discounts).map((v) => BigNumber(v))
  );
  let makerFee = BigNumber(fees.makerFee);
  let makerRebate = BigNumber(fees.highVolumeMakerFee);

  // In auction the fee is shared 50/50 between the maker and the taker
  // so divide it by 2 for a more accurate estimate
  if (isAuction) {
    feeDiscounted = feeDiscounted.div(2);
    discount = discount.div(2);
    makerRebate = makerRebate.div(2);
    makerFee = makerFee.div(2);
  }

  const fee = feeDiscounted.plus(discount);
  const discountPct = discount.div(fee).times(100);
  const makerRebatePct = makerRebate.div(makerFee).times(100);

  return {
    fee,
    feeDiscounted,
    discount,
    discountPct,
    makerRebate,
    makerRebatePct,
  };
};
