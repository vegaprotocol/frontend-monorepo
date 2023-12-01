import BigNumber from 'bignumber.js';
import type {
  FillFieldsFragment,
  TradeFeeFieldsFragment,
} from './__generated__/Fills';
import * as Schema from '@vegaprotocol/types';

export const TAKER = 'Taker';
export const MAKER = 'Maker';

export type Role = typeof TAKER | typeof MAKER | '-';

export const getRoleAndFees = ({
  data,
  partyId,
}: {
  data: Pick<
    FillFieldsFragment,
    'buyerFee' | 'sellerFee' | 'buyer' | 'seller' | 'aggressor'
  >;
  partyId?: string;
}): {
  role: Role;
  fees?: TradeFeeFieldsFragment;
  marketState?: Schema.MarketState;
} => {
  let role: Role;
  let fees;

  if (data?.buyer.id === partyId) {
    if (data.aggressor === Schema.Side.SIDE_BUY) {
      role = TAKER;
      fees = data?.buyerFee;
    } else if (data.aggressor === Schema.Side.SIDE_SELL) {
      role = MAKER;
      fees = data?.sellerFee;
    } else {
      role = '-';
      fees = !isEmptyFeeObj(data?.buyerFee) ? data.buyerFee : data.sellerFee;
    }
  } else if (data?.seller.id === partyId) {
    if (data.aggressor === Schema.Side.SIDE_SELL) {
      role = TAKER;
      fees = data?.sellerFee;
    } else if (data.aggressor === Schema.Side.SIDE_BUY) {
      role = MAKER;
      fees = data?.buyerFee;
    } else {
      role = '-';
      fees = !isEmptyFeeObj(data.sellerFee) ? data.sellerFee : data.buyerFee;
    }
  } else {
    return { role: '-', fees: undefined };
  }

  // We make the assumption that the market state is active if the maker fee is zero on both sides
  // This needs to be updated when we have a way to get the correct market state when that fill happened from the API
  // because the maker fee factor can be set to 0 via governance
  const marketState =
    data?.buyerFee.makerFee === data.sellerFee.makerFee &&
    new BigNumber(data?.buyerFee.makerFee).isZero()
      ? Schema.MarketState.STATE_SUSPENDED
      : Schema.MarketState.STATE_ACTIVE;
  return { role, fees, marketState };
};

export const getFeesBreakdown = (
  role: Role,
  fees: TradeFeeFieldsFragment,
  marketState: Schema.MarketState = Schema.MarketState.STATE_ACTIVE
) => {
  // If market is in auction we assume maker fee is zero
  const isMarketActive = marketState === Schema.MarketState.STATE_ACTIVE;

  // If role is taker, then these are the fees to be paid
  let { makerFee, infrastructureFee, liquidityFee } = fees;
  // If role is taker, then these are the fees discounts to be applied
  let {
    makerFeeVolumeDiscount,
    makerFeeReferralDiscount,
    infrastructureFeeVolumeDiscount,
    infrastructureFeeReferralDiscount,
    liquidityFeeVolumeDiscount,
    liquidityFeeReferralDiscount,
  } = fees;

  if (isMarketActive) {
    if (role === MAKER) {
      makerFee = new BigNumber(fees.makerFee).times(-1).toString();
      infrastructureFee = '0';
      liquidityFee = '0';

      // discounts are also zero or we can leave them undefined
      infrastructureFeeReferralDiscount =
        infrastructureFeeReferralDiscount && '0';
      infrastructureFeeVolumeDiscount = infrastructureFeeVolumeDiscount && '0';
      liquidityFeeReferralDiscount = liquidityFeeReferralDiscount && '0';
      liquidityFeeVolumeDiscount = liquidityFeeVolumeDiscount && '0';

      // we leave maker discount fees as they are defined
    }
  } else {
    // If market is suspended (in monitoring auction), then half of the fees are paid
    infrastructureFee = new BigNumber(infrastructureFee)
      .dividedBy(2)
      .toString();
    liquidityFee = new BigNumber(liquidityFee).dividedBy(2).toString();
    // maker fee is already zero
    makerFee = '0';

    // discounts are also halved
    infrastructureFeeReferralDiscount =
      infrastructureFeeReferralDiscount &&
      new BigNumber(infrastructureFeeReferralDiscount).dividedBy(2).toString();
    infrastructureFeeVolumeDiscount =
      infrastructureFeeVolumeDiscount &&
      new BigNumber(infrastructureFeeVolumeDiscount).dividedBy(2).toString();
    liquidityFeeReferralDiscount =
      liquidityFeeReferralDiscount &&
      new BigNumber(liquidityFeeReferralDiscount).dividedBy(2).toString();
    liquidityFeeVolumeDiscount =
      liquidityFeeVolumeDiscount &&
      new BigNumber(liquidityFeeVolumeDiscount).dividedBy(2).toString();
    // maker discount fees should already be zero
    makerFeeReferralDiscount = makerFeeReferralDiscount && '0';
    makerFeeVolumeDiscount = makerFeeVolumeDiscount && '0';
  }

  const totalFee = new BigNumber(infrastructureFee)
    .plus(makerFee)
    .plus(liquidityFee)
    .toString();

  const totalFeeDiscount = new BigNumber(makerFeeVolumeDiscount || '0')
    .plus(makerFeeReferralDiscount || '0')
    .plus(infrastructureFeeReferralDiscount || '0')
    .plus(infrastructureFeeVolumeDiscount || '0')
    .plus(liquidityFeeReferralDiscount || '0')
    .plus(liquidityFeeVolumeDiscount || '0')
    .toString();

  return {
    infrastructureFee,
    infrastructureFeeReferralDiscount,
    infrastructureFeeVolumeDiscount,
    liquidityFee,
    liquidityFeeReferralDiscount,
    liquidityFeeVolumeDiscount,
    makerFee,
    makerFeeReferralDiscount,
    makerFeeVolumeDiscount,
    totalFee,
    totalFeeDiscount,
  };
};

export const isEmptyFeeObj = (feeObj: Schema.TradeFee) => {
  if (!feeObj) return true;
  return (
    feeObj.liquidityFee === '0' &&
    feeObj.makerFee === '0' &&
    feeObj.infrastructureFee === '0'
  );
};
