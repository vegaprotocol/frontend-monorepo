import {
  OrderTimeInForce,
  OrderType,
  StopOrderSizeOverrideSetting,
} from '@vegaprotocol/types';
import { toDecimal } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import {
  NON_PERSISTENT_TIF_OPTIONS,
  PERSISTENT_TIF_OPTIONS,
} from './constants';

import { Side, StopOrderTriggerDirection } from '@vegaprotocol/types';
import { addDecimal, removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import {
  SizeOverrideSetting,
  type OrderSubmission,
  type StopOrderSetup,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';

import {
  FormFieldsLimit,
  FormFieldsMarket,
  FormFieldsStopLimit,
  FormFieldsStopMarket,
} from './schemas';

export const toPercentOf = (pct: number, value: BigNumber) => {
  return BigNumber(pct).div(100).times(value);
};

export const toNotional = (size: BigNumber, price: BigNumber) => {
  return size.times(price);
};

export const toSize = (
  notional: BigNumber,
  price: BigNumber,
  decimals: number
) => {
  const val = notional.div(price);
  return roundToPositionDecimals(val, decimals);
};

export const roundToPositionDecimals = (size: BigNumber, decimals: number) => {
  return size.minus(size.mod(toDecimal(decimals)));
};

export const getDiscountedFee = (
  feeAmount: string,
  referralDiscountFactor?: string,
  volumeDiscountFactor?: string
) => {
  if (
    ((!referralDiscountFactor || referralDiscountFactor === '0') &&
      (!volumeDiscountFactor || volumeDiscountFactor === '0')) ||
    !feeAmount ||
    feeAmount === '0'
  ) {
    return {
      discountedFee: feeAmount,
      volumeDiscount: '0',
      referralDiscount: '0',
      totalDiscount: '0',
    };
  }
  const referralDiscount = new BigNumber(referralDiscountFactor || '0')
    .multipliedBy(feeAmount)
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const volumeDiscount = new BigNumber(volumeDiscountFactor || '0')
    .multipliedBy((BigInt(feeAmount) - BigInt(referralDiscount)).toString())
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const totalDiscount = (
    BigInt(referralDiscount) + BigInt(volumeDiscount)
  ).toString();
  const discountedFee = (
    BigInt(feeAmount || '0') - BigInt(totalDiscount)
  ).toString();
  return {
    totalDiscount,
    referralDiscount,
    volumeDiscount,
    discountedFee,
  };
};

export const getTotalDiscountFactor = (feeEstimate?: {
  volumeDiscountFactor?: string;
  referralDiscountFactor?: string;
}) => {
  if (
    !feeEstimate ||
    (feeEstimate.referralDiscountFactor === '0' &&
      feeEstimate.volumeDiscountFactor === '0')
  ) {
    return '0';
  }
  const volumeFactor = new BigNumber(
    feeEstimate?.volumeDiscountFactor || 0
  ).minus(1);
  const referralFactor = new BigNumber(
    feeEstimate?.referralDiscountFactor || 0
  ).minus(1);
  if (volumeFactor.isZero()) {
    return feeEstimate.referralDiscountFactor
      ? `-${feeEstimate.referralDiscountFactor}`
      : '0';
  }
  if (referralFactor.isZero()) {
    return feeEstimate.volumeDiscountFactor
      ? `-${feeEstimate.volumeDiscountFactor}`
      : '0';
  }
  return volumeFactor.multipliedBy(referralFactor).minus(1).toString();
};

export const isNonPersistentOrder = (timeInForce: OrderTimeInForce) => {
  return NON_PERSISTENT_TIF_OPTIONS.includes(timeInForce);
};

export const isPersistentOrder = (timeInForce: OrderTimeInForce) => {
  return PERSISTENT_TIF_OPTIONS.includes(timeInForce);
};

type MarketData = {
  id: string;
  decimalPlaces: number;
  positionDecimalPlaces: number;
};

export const createMarketOrder = (
  fields: FormFieldsMarket,
  market: MarketData,
  reference?: string
): OrderSubmission => {
  return {
    reference,
    marketId: market.id,
    type: fields.type,
    side: fields.side,
    timeInForce: fields.timeInForce,
    price: undefined,
    size: removeDecimal(fields.size.toString(), market.positionDecimalPlaces),
    expiresAt: undefined,
    reduceOnly: fields.reduceOnly,
  };
};

export const createLimitOrder = (
  fields: FormFieldsLimit,
  market: MarketData,
  reference?: string
): OrderSubmission => {
  const icebergOpts =
    fields.iceberg && fields.icebergPeakSize && fields.icebergMinVisibleSize
      ? {
          peakSize: removeDecimal(
            fields.icebergPeakSize.toString(),
            market.positionDecimalPlaces
          ),
          minimumVisibleSize: removeDecimal(
            fields.icebergMinVisibleSize.toString(),
            market.positionDecimalPlaces
          ),
        }
      : undefined;

  return {
    reference,
    marketId: market.id,
    type: fields.type,
    side: fields.side,
    timeInForce: fields.timeInForce,
    price: removeDecimal(fields.price.toString(), market.decimalPlaces),
    size: removeDecimal(fields.size.toString(), market.positionDecimalPlaces),
    expiresAt:
      fields.expiresAt &&
      fields.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
        ? toNanoSeconds(fields.expiresAt)
        : undefined,
    postOnly: fields.postOnly,
    reduceOnly: fields.reduceOnly,
    icebergOpts,
  };
};

export const createStopMarketOrder = (
  fields: FormFieldsStopMarket,
  market: MarketData,
  reference?: string
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {
    risesAbove: undefined,
    fallsBelow: undefined,
  };

  const isSizeOverridden =
    fields.sizeOverride ===
    StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;

  const size = isSizeOverridden
    ? addDecimal('1', market.positionDecimalPlaces)
    : fields.size.toString();

  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: {
      reference,
      marketId: market.id,
      type: fields.type,
      side: fields.side,
      timeInForce: fields.timeInForce,
      price: undefined,
      size: size,
      expiresAt: undefined,
      reduceOnly: fields.reduceOnly,
    },
    expiresAt:
      fields.stopExpiry && fields.stopExpiresAt
        ? toNanoSeconds(fields.stopExpiresAt)
        : undefined,
    expiryStrategy: fields.stopExpiryStrategy,
    price:
      fields.triggerType === 'price'
        ? removeDecimal(fields.triggerPrice.toString(), market.decimalPlaces)
        : undefined,
    trailingPercentOffset:
      fields.triggerType === 'trailingPercentOffset'
        ? (fields.triggerPrice / 100).toFixed(3)
        : undefined,
    sizeOverrideSetting: sizeOverrideMap[fields.sizeOverride],
    sizeOverrideValue: isSizeOverridden
      ? { percentage: (fields.size / 100).toString() }
      : undefined,
  };

  let oppositeStopOrderSetup: StopOrderSetup | undefined = undefined;

  if (fields.oco) {
    if (!fields.ocoSize) {
      throw new Error('no ocoSize specified');
    }

    const ocoSizeOverridden =
      fields.ocoSizeOverride ===
      StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;

    oppositeStopOrderSetup = {
      orderSubmission: {
        reference,
        marketId: market.id,
        type: fields.ocoType,
        side: fields.side,
        timeInForce: fields.ocoTimeInForce,
        price: undefined,
        size: ocoSizeOverridden
          ? addDecimal('1', market.positionDecimalPlaces)
          : fields.ocoSize.toString(),
        expiresAt: undefined,
        reduceOnly: fields.reduceOnly,
      },
      sizeOverrideSetting: sizeOverrideMap[fields.ocoSizeOverride],
      sizeOverrideValue: ocoSizeOverridden
        ? { percentage: (fields.ocoSize / 100).toString() }
        : undefined,
    };
  }

  if (fields.stopExpiry && fields.stopExpiresAt) {
    const expiresAt = toNanoSeconds(fields.stopExpiresAt);
    stopOrderSetup.expiresAt = expiresAt;
    stopOrderSetup.expiryStrategy = fields.stopExpiryStrategy;

    if (oppositeStopOrderSetup) {
      oppositeStopOrderSetup.expiresAt = expiresAt;
      oppositeStopOrderSetup.expiryStrategy = fields.stopExpiryStrategy;
    }
  }

  if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
  ) {
    submission.risesAbove = stopOrderSetup;
    submission.fallsBelow = oppositeStopOrderSetup;
  } else if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
  ) {
    submission.risesAbove = oppositeStopOrderSetup;
    submission.fallsBelow = stopOrderSetup;
  }

  return submission;
};

export const createStopLimitOrder = (
  fields: FormFieldsStopLimit,
  market: MarketData,
  reference?: string
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {
    risesAbove: undefined,
    fallsBelow: undefined,
  };

  const isSizeOverridden =
    fields.sizeOverride ===
    StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;

  const size = isSizeOverridden
    ? addDecimal('1', market.positionDecimalPlaces)
    : fields.size.toString();

  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: {
      reference,
      marketId: market.id,
      type: fields.type,
      side: fields.side,
      timeInForce: fields.timeInForce,
      price: fields.price.toString(),
      size: size,
      expiresAt: undefined,
      reduceOnly: fields.reduceOnly,
    },
    expiresAt:
      fields.stopExpiry && fields.stopExpiresAt
        ? toNanoSeconds(fields.stopExpiresAt)
        : undefined,
    expiryStrategy: fields.stopExpiryStrategy,
    price:
      fields.triggerType === 'price'
        ? removeDecimal(fields.triggerPrice.toString(), market.decimalPlaces)
        : undefined,
    trailingPercentOffset:
      fields.triggerType === 'trailingPercentOffset'
        ? (fields.triggerPrice / 100).toFixed(3)
        : undefined,
    sizeOverrideSetting: sizeOverrideMap[fields.sizeOverride],
    sizeOverrideValue: isSizeOverridden
      ? { percentage: (fields.size / 100).toString() }
      : undefined,
  };

  let oppositeStopOrderSetup: StopOrderSetup | undefined = undefined;

  if (fields.oco) {
    if (!fields.ocoSize) {
      throw new Error('no ocoSize specified');
    }

    if (!fields.ocoPrice) {
      throw new Error('no ocoPrice specified');
    }

    const ocoSizeOverridden =
      fields.ocoSizeOverride ===
      StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;

    oppositeStopOrderSetup = {
      orderSubmission: {
        reference,
        marketId: market.id,
        type: fields.ocoType,
        side: fields.side,
        timeInForce: fields.ocoTimeInForce,
        price: fields.ocoPrice.toString(),
        size: ocoSizeOverridden
          ? addDecimal('1', market.positionDecimalPlaces)
          : fields.ocoSize.toString(),
        expiresAt: undefined,
        reduceOnly: fields.reduceOnly,
      },
      sizeOverrideSetting: sizeOverrideMap[fields.ocoSizeOverride],
      sizeOverrideValue: ocoSizeOverridden
        ? { percentage: (fields.ocoSize / 100).toString() }
        : undefined,
    };
  }

  if (fields.stopExpiry && fields.stopExpiresAt) {
    const expiresAt = toNanoSeconds(fields.stopExpiresAt);
    stopOrderSetup.expiresAt = expiresAt;
    stopOrderSetup.expiryStrategy = fields.stopExpiryStrategy;

    if (oppositeStopOrderSetup) {
      oppositeStopOrderSetup.expiresAt = expiresAt;
      oppositeStopOrderSetup.expiryStrategy = fields.stopExpiryStrategy;
    }
  }

  if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
  ) {
    submission.risesAbove = stopOrderSetup;
    submission.fallsBelow = oppositeStopOrderSetup;
  } else if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
  ) {
    submission.risesAbove = oppositeStopOrderSetup;
    submission.fallsBelow = stopOrderSetup;
  }

  return submission;
};

export const createMarketOrderWithTpSl = (
  fields: FormFieldsMarket,
  market: MarketData,
  reference?: string
) => {
  const orderSubmission = createMarketOrder(fields, market, reference);
  const stopOrdersSubmission = [];

  const oppositeSide =
    fields.side === Side.SIDE_BUY ? Side.SIDE_SELL : Side.SIDE_BUY;
  // For direction it needs to be implied
  //  If position is LONG (BUY)
  //  TP is SHORT and trigger is RISES ABOVE
  //  If position is SHORT
  //  TP is LONG and trigger is FALLS BELOW
  const takeProfitTriggerDirection =
    fields.side === Side.SIDE_BUY
      ? StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      : StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW;
  //  For direction it needs to be implied
  //  If position is LONG (BUY)
  //  SL is SHORT and trigger is FALLS BELOW
  //  If position is SHORT
  //  SL is LONG and trigger is RISES ABOVE
  const stopLossTriggerDirection =
    fields.side === Side.SIDE_BUY
      ? StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      : StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;

  if (fields.takeProfit && fields.stopLoss) {
    const ocoStopOrderSubmission = createStopMarketOrder(
      {
        ticketType: 'stopMarket',
        type: OrderType.TYPE_MARKET,
        side: oppositeSide,
        triggerDirection: stopLossTriggerDirection,
        triggerType: 'price',
        triggerPrice: fields.stopLoss,
        sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
        size: fields.size,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
        stopExpiry: false,
        reduceOnly: true,
        oco: true,
        ocoType: OrderType.TYPE_MARKET,
        ocoTriggerDirection:
          fields.side === Side.SIDE_BUY
            ? StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
            : StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
        ocoTriggerType: 'price',
        ocoTriggerPrice: fields.takeProfit,
        ocoSizeOverride:
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
        ocoSize: fields.size,
        ocoPrice: fields.takeProfit,
        ocoTimeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
      market,
      reference
    );
    stopOrdersSubmission.push(ocoStopOrderSubmission);
  } else if (fields.takeProfit) {
    const ocoStopOrderSubmission = createStopMarketOrder(
      {
        ticketType: 'stopMarket',
        type: OrderType.TYPE_MARKET,
        side: oppositeSide,
        triggerDirection: takeProfitTriggerDirection,
        triggerType: 'price',
        triggerPrice: fields.takeProfit,
        sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
        size: fields.size,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
        stopExpiry: false,
        reduceOnly: true,
        oco: false,
      },
      market,
      reference
    );
    stopOrdersSubmission.push(ocoStopOrderSubmission);
  } else if (fields.stopLoss) {
    const ocoStopOrderSubmission = createStopMarketOrder(
      {
        ticketType: 'stopMarket',
        type: OrderType.TYPE_MARKET,
        side: oppositeSide,
        triggerDirection: stopLossTriggerDirection,
        triggerType: 'price',
        triggerPrice: fields.stopLoss,
        sizeOverride: StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
        size: fields.size,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
        stopExpiry: false,
        reduceOnly: true,
        oco: false,
      },
      market,
      reference
    );
    stopOrdersSubmission.push(ocoStopOrderSubmission);
  }

  return {
    submissions: [orderSubmission],
    stopOrdersSubmission,
  };
};

const sizeOverrideMap: {
  [S in StopOrderSizeOverrideSetting]: SizeOverrideSetting;
} = {
  [StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_UNSPECIFIED]:
    SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
  [StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE]:
    SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
  [StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION]:
    SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION,
};
