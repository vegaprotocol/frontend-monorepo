import { isMarketInAuction } from '@vegaprotocol/markets';

import { useEstimateFeesQuery } from '../__generated__/EstimateFees';
import { getDiscountedFee } from '../utils';
import BigNumber from 'bignumber.js';
import { useEstimateFeesVariables } from './use-estimate-fees-variables';
import { type MarketTradingMode } from '@vegaprotocol/types';
import { type FormFields } from '../schemas';

type UseEstimateFeesArgs = {
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
  if (args.values.postOnly) {
    return {
      fee: '0',
      feeDiscounted: '0',
      discount: '0',
      discountPct: '0',
      makerRebate: '0',
      makerRebatePct: '0',
    };
  }

  const atEpoch = (Number(data?.epoch.id) || 0) - 1;

  const volumeDiscountFactor =
    (data?.volumeDiscountStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.volumeDiscountStats.edges[0]?.node.discountFactor) ||
    '0';
  const referralDiscountFactor =
    (data?.referralSetStats.edges[0]?.node.atEpoch === atEpoch &&
      data?.referralSetStats.edges[0]?.node.discountFactor) ||
    '0';

  let fee = data?.estimateFees.totalFeeAmount || '0';
  const makerRebate = data?.estimateFees.fees.highVolumeMakerFee || '0';

  // In auction the fee is shared 50/50 between the maker and the taker
  // so divide it by 2 for a more accurate estimate
  if (isAuction) {
    fee = (BigInt(fee) / BigInt(2)).toString();
  }

  const { totalDiscount, discountedFee } = getDiscountedFee(
    fee,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  const hasFee = fee && fee !== '0';

  return {
    fee,
    feeDiscounted: discountedFee,
    discount: totalDiscount,
    discountPct: hasFee
      ? BigNumber(fee).minus(discountedFee).div(fee).times(100).toString()
      : '0',
    makerRebate,
    makerRebatePct: hasFee
      ? BigNumber(makerRebate).div(fee).times(100).toString()
      : '0',
  };
};
