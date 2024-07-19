import {
  OrderTimeInForce,
  OrderType,
  StopOrderSizeOverrideSetting,
  StopOrderExpiryStrategy,
} from '@vegaprotocol/types';
import { addDecimal, toDecimal } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import {
  NON_PERSISTENT_TIF_OPTIONS,
  PERSISTENT_TIF_OPTIONS,
} from './constants';

import { Side, StopOrderTriggerDirection } from '@vegaprotocol/types';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import {
  SizeOverrideSetting,
  type OrderSubmission,
  type StopOrderSetup,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';

import {
  type FormFieldsLimit,
  type FormFieldsMarket,
  type FormFieldsStopLimit,
  type FormFieldsStopMarket,
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
    feeEstimate.volumeDiscountFactor || 0
  ).minus(1);

  const referralFactor = new BigNumber(
    feeEstimate.referralDiscountFactor || 0
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

export const isPersistentTif = (timeInForce: OrderTimeInForce) => {
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
  const trigger = createTrigger(fields, market.decimalPlaces);
  const expiry = createStopExpiry(fields);
  const sizeOverride = createSizeOverride(fields);
  const isOverride = sizeOverride.sizeOverrideSetting === 2;

  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: {
      reference,
      marketId: market.id,
      type: fields.type,
      side: fields.side,
      timeInForce: fields.timeInForce,
      size: isOverride
        ? addDecimal('1', market.positionDecimalPlaces)
        : removeDecimal(fields.size.toString(), market.positionDecimalPlaces),
      reduceOnly: fields.reduceOnly,
    },
    ...expiry,
    ...trigger,
    ...sizeOverride,
  };

  let oppositeStopOrderSetup: StopOrderSetup | undefined = undefined;

  if (fields.oco) {
    if (!fields.ocoSize) {
      throw new Error('no ocoSize specified');
    }
    if (!fields.ocoTimeInForce) {
      throw new Error('no ocoTimeInForce specified');
    }
    if (!fields.ocoSizeOverride) {
      throw new Error('no ocoSizeOverride specified');
    }
    if (!fields.ocoTriggerType) {
      throw new Error('no ocoSizeOverride specified');
    }
    if (!fields.ocoTriggerPrice) {
      throw new Error('no ocoSizeOverride specified');
    }

    const trigger = createTrigger(
      {
        triggerType: fields.ocoTriggerType,
        triggerPrice: fields.ocoTriggerPrice,
      },
      market.decimalPlaces
    );
    const sizeOverride = createSizeOverride({
      sizeOverride: fields.ocoSizeOverride,
      size: fields.ocoSize,
    });
    const isOverride = sizeOverride.sizeOverrideSetting === 2;

    oppositeStopOrderSetup = {
      orderSubmission: {
        reference,
        marketId: market.id,
        type: OrderType.TYPE_MARKET,
        side: fields.side,
        timeInForce: fields.ocoTimeInForce,
        price: undefined,
        size: isOverride
          ? addDecimal('1', market.positionDecimalPlaces)
          : removeDecimal(
              fields.ocoSize.toString(),
              market.positionDecimalPlaces
            ),
        reduceOnly: fields.reduceOnly,
      },
      ...expiry,
      ...trigger,
      ...sizeOverride,
    };
  }

  return createStopOrderSubmission(
    fields,
    stopOrderSetup,
    oppositeStopOrderSetup
  );
};

export const createStopLimitOrder = (
  fields: FormFieldsStopLimit,
  market: MarketData,
  reference?: string
): StopOrdersSubmission => {
  const trigger = createTrigger(fields, market.decimalPlaces);
  const expiry = createStopExpiry(fields);
  const sizeOverride = createSizeOverride(fields);
  const isOverride = sizeOverride.sizeOverrideSetting === 2;

  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: {
      reference,
      marketId: market.id,
      type: fields.type,
      side: fields.side,
      timeInForce: fields.timeInForce,
      price: removeDecimal(fields.price.toString(), market.decimalPlaces),
      size: isOverride
        ? addDecimal('1', market.positionDecimalPlaces)
        : removeDecimal(fields.size.toString(), market.positionDecimalPlaces),
      expiresAt:
        fields.expiresAt &&
        fields.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
          ? toNanoSeconds(fields.expiresAt)
          : undefined,
      reduceOnly: fields.reduceOnly,
    },
    ...trigger,
    ...sizeOverride,
    ...expiry,
  };

  let oppositeStopOrderSetup: StopOrderSetup | undefined = undefined;

  if (fields.oco) {
    if (!fields.ocoPrice) {
      throw new Error('no ocoPrice specified');
    }
    if (!fields.ocoSize) {
      throw new Error('no ocoSize specified');
    }
    if (!fields.ocoTimeInForce) {
      throw new Error('no ocoTimeInForce specified');
    }
    if (!fields.ocoSizeOverride) {
      throw new Error('no ocoSizeOverride specified');
    }
    if (!fields.ocoTriggerType) {
      throw new Error('no ocoTriggerType specified');
    }
    if (!fields.ocoTriggerPrice) {
      throw new Error('no ocoTriggerPrice specified');
    }

    const sizeOverride = createSizeOverride({
      sizeOverride: fields.ocoSizeOverride,
      size: fields.ocoSize,
    });
    const isOverride = sizeOverride.sizeOverrideSetting === 2;
    const trigger = createTrigger(
      {
        triggerType: fields.ocoTriggerType,
        triggerPrice: fields.ocoTriggerPrice,
      },
      market.decimalPlaces
    );

    oppositeStopOrderSetup = {
      orderSubmission: {
        reference,
        marketId: market.id,
        type: OrderType.TYPE_LIMIT,
        side: fields.side,
        timeInForce: fields.ocoTimeInForce,
        price: removeDecimal(fields.ocoPrice.toString(), market.decimalPlaces),
        size: isOverride
          ? addDecimal('1', market.positionDecimalPlaces)
          : removeDecimal(
              fields.ocoSize.toString(),
              market.positionDecimalPlaces
            ),
        expiresAt:
          fields.ocoExpiresAt &&
          fields.ocoTimeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
            ? toNanoSeconds(fields.ocoExpiresAt)
            : undefined,
        reduceOnly: fields.reduceOnly,
      },
      ...trigger,
      ...sizeOverride,
      ...expiry,
    };
  }

  return createStopOrderSubmission(
    fields,
    stopOrderSetup,
    oppositeStopOrderSetup
  );
};

export const createStopOrderSubmission = (
  fields: FormFieldsStopMarket | FormFieldsStopLimit,
  stopOrderSetup: StopOrderSetup,
  oppositeStopOrderSetup?: StopOrderSetup
) => {
  if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
  ) {
    return {
      risesAbove: stopOrderSetup,
      fallsBelow: oppositeStopOrderSetup,
    };
  } else if (
    fields.triggerDirection ===
    StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
  ) {
    return {
      risesAbove: oppositeStopOrderSetup,
      fallsBelow: stopOrderSetup,
    };
  }

  throw new Error('could not create stop order');
};

export const createTrigger = (
  fields: {
    triggerType: 'price' | 'trailingPercentOffset';
    triggerPrice: number;
  },
  dps: number
) => {
  if (fields.triggerType === 'price') {
    return {
      price: removeDecimal(fields.triggerPrice.toString(), dps),
    };
  }
  if (fields.triggerType === 'trailingPercentOffset') {
    return {
      trailingPercentOffset: (fields.triggerPrice / 100).toFixed(3),
    };
  }
};

export const createSizeOverride = (fields: {
  sizeOverride: StopOrderSizeOverrideSetting;
  size: string | number;
}) => {
  const isSizeOverridden =
    fields.sizeOverride ===
    StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;
  return {
    sizeOverrideSetting: sizeOverrideMap[fields.sizeOverride],
    sizeOverrideValue: isSizeOverridden
      ? { percentage: (Number(fields.size) / 100).toFixed(3) }
      : undefined,
  };
};

export const createStopExpiry = (fields: {
  stopExpiresAt?: Date;
  stopExpiryStrategy?: StopOrderExpiryStrategy;
}) => {
  if (
    fields.stopExpiryStrategy ===
      StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED ||
    !fields.stopExpiresAt
  ) {
    return;
  }
  const expiresAt = toNanoSeconds(fields.stopExpiresAt);
  return {
    expiresAt: expiresAt,
    expiryStrategy: fields.stopExpiryStrategy,
  };
};

export const createOrderWithTpSl = (
  fields: FormFieldsMarket | FormFieldsLimit,
  market: MarketData,
  reference?: string
) => {
  const orderSubmission =
    fields.ticketType === 'market'
      ? createMarketOrder(fields, market, reference)
      : createLimitOrder(fields, market, reference);

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
