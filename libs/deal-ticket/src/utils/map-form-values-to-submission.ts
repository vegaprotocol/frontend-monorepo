import {
  SizeOverrideSetting,
  type OrderSubmission,
  type StopOrderSetup,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import type {
  OrderFormValues,
  StopOrderFormValues,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { addDecimal, removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import { isPersistentOrder } from './time-in-force-persistence';
import { isSpot, type MarketFieldsFragment } from '@vegaprotocol/markets';

export const mapFormValuesToOrderSubmission = (
  order: OrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number,
  reference?: string
): OrderSubmission => ({
  reference,
  marketId: marketId,
  type: order.type,
  side: order.side,
  timeInForce: order.timeInForce,
  price:
    order.type === Schema.OrderType.TYPE_LIMIT && order.price
      ? removeDecimal(order.price, decimalPlaces)
      : undefined,
  size: removeDecimal(order.size, positionDecimalPlaces),
  expiresAt:
    order.expiresAt &&
    order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
      ? toNanoSeconds(order.expiresAt)
      : undefined,
  postOnly:
    order.type === Schema.OrderType.TYPE_MARKET ||
    [
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    ].includes(order.timeInForce)
      ? false
      : order.postOnly,
  reduceOnly: ![
    Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
    Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  ].includes(order.timeInForce)
    ? false
    : order.reduceOnly,
  icebergOpts:
    order.type === Schema.OrderType.TYPE_LIMIT &&
    isPersistentOrder(order.timeInForce) &&
    order.iceberg &&
    order.peakSize &&
    order.minimumVisibleSize
      ? {
          peakSize: removeDecimal(order.peakSize, positionDecimalPlaces),
          minimumVisibleSize: removeDecimal(
            order.minimumVisibleSize,
            positionDecimalPlaces
          ),
        }
      : undefined,
});

const setTrigger = (
  stopOrderSetup: StopOrderSetup,
  triggerType: StopOrderFormValues['triggerPrice'],
  triggerPrice: StopOrderFormValues['triggerPrice'],
  triggerTrailingPercentOffset: StopOrderFormValues['triggerTrailingPercentOffset'],
  decimalPlaces: number
) => {
  if (triggerType === 'price') {
    stopOrderSetup.price = removeDecimal(triggerPrice ?? '', decimalPlaces);
  } else if (triggerType === 'trailingPercentOffset') {
    stopOrderSetup.trailingPercentOffset = (
      Number(triggerTrailingPercentOffset) / 100
    ).toFixed(3);
  }
};

export const mapFormValuesToStopOrdersSubmission = (
  data: StopOrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number,
  isSpotMarket = false,
  reference?: string
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {
    risesAbove: undefined,
    fallsBelow: undefined,
  };
  const useSizeOverride =
    data.sizeOverrideSetting ===
    Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;
  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: mapFormValuesToOrderSubmission(
      {
        type: data.type,
        side: data.side,
        size: useSizeOverride
          ? addDecimal('1', positionDecimalPlaces)
          : data.size || '',
        timeInForce: data.timeInForce,
        price: data.price,
        reduceOnly: !isSpotMarket,
        postOnly: isSpotMarket ? !!data.postOnly : false,
        expiresAt: data.orderExpiresAt,
      },
      marketId,
      decimalPlaces,
      positionDecimalPlaces,
      reference
    ),
    sizeOverrideSetting: useSizeOverride
      ? SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      : SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
    sizeOverrideValue: useSizeOverride
      ? { percentage: (Number(data.sizeOverrideValue) / 100).toString() }
      : undefined,
  };
  setTrigger(
    stopOrderSetup,
    data.triggerType,
    data.triggerPrice,
    data.triggerTrailingPercentOffset,
    decimalPlaces
  );
  let oppositeStopOrderSetup: StopOrderSetup | undefined = undefined;
  if (data.oco) {
    const useSizeOverride =
      data.ocoSizeOverrideSetting ===
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION;
    oppositeStopOrderSetup = {
      orderSubmission: mapFormValuesToOrderSubmission(
        {
          type: data.ocoType,
          side: data.side,
          size: useSizeOverride
            ? addDecimal('1', positionDecimalPlaces)
            : data.ocoSize || '',
          timeInForce: data.ocoTimeInForce,
          price: data.ocoPrice,
          reduceOnly: !isSpotMarket,
          postOnly: isSpotMarket ? !!data.ocoPostOnly : false,
          expiresAt: data.ocoOrderExpiresAt,
        },
        marketId,
        decimalPlaces,
        positionDecimalPlaces,
        reference
      ),
      sizeOverrideSetting: useSizeOverride
        ? SizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
        : SizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
      sizeOverrideValue: useSizeOverride
        ? { percentage: (Number(data.ocoSizeOverrideValue) / 100).toString() }
        : undefined,
    };
    setTrigger(
      oppositeStopOrderSetup,
      data.ocoTriggerType,
      data.ocoTriggerPrice,
      data.ocoTriggerTrailingPercentOffset,
      decimalPlaces
    );
  }

  if (data.expire) {
    const expiresAt = data.expiresAt && toNanoSeconds(data.expiresAt);
    stopOrderSetup.expiresAt = expiresAt;
    stopOrderSetup.expiryStrategy = data.expiryStrategy;
    if (oppositeStopOrderSetup) {
      oppositeStopOrderSetup.expiresAt = expiresAt;
      oppositeStopOrderSetup.expiryStrategy = data.expiryStrategy;
    }
  }

  if (
    data.triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
  ) {
    submission.risesAbove = stopOrderSetup;
    submission.fallsBelow = oppositeStopOrderSetup;
  }
  if (
    data.triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
  ) {
    submission.fallsBelow = stopOrderSetup;
    submission.risesAbove = oppositeStopOrderSetup;
  }

  return submission;
};

export const mapFormValuesToTakeProfitAndStopLoss = (
  formValues: OrderFormValues,
  market: MarketFieldsFragment,
  reference: string
) => {
  const orderSubmission = mapFormValuesToOrderSubmission(
    formValues,
    market.id,
    market.decimalPlaces,
    market.positionDecimalPlaces,
    reference
  );

  const oppositeSide =
    formValues.side === Schema.Side.SIDE_BUY
      ? Schema.Side.SIDE_SELL
      : Schema.Side.SIDE_BUY;
  // For direction it needs to be implied
  //  If position is LONG (BUY)
  //  TP is SHORT and trigger is RISES ABOVE
  //  If position is SHORT
  //  TP is LONG and trigger is FALLS BELOW
  const takeProfitTriggerDirection =
    formValues.side === Schema.Side.SIDE_BUY
      ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW;
  //  For direction it needs to be implied
  //  If position is LONG (BUY)
  //  SL is SHORT and trigger is FALLS BELOW
  //  If position is SHORT
  //  SL is LONG and trigger is RISES ABOVE
  const stopLossTriggerDirection =
    formValues.side === Schema.Side.SIDE_BUY
      ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
      : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;

  const stopOrdersSubmission = [];

  // if there are both take profit and stop loss then the stop order needs to be OCO
  if (formValues.takeProfit && formValues.stopLoss) {
    const ocoStopOrderSubmission = mapFormValuesToStopOrdersSubmission(
      {
        ...formValues,
        triggerPrice: formValues.stopLoss,
        ocoTriggerPrice: formValues.takeProfit,
        price: formValues.stopLoss,
        triggerDirection: stopLossTriggerDirection,
        triggerType: 'price',
        side: oppositeSide,
        expire: false,
        type: Schema.OrderType.TYPE_MARKET,
        oco: true,
        ocoPrice: formValues.takeProfit,
        ocoTriggerType: 'price',
        ocoType: Schema.OrderType.TYPE_MARKET,
        ocoSize: formValues.size,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
      market.id,
      market.decimalPlaces,
      market.positionDecimalPlaces,
      isSpot(market.tradableInstrument.instrument.product),
      reference
    );
    stopOrdersSubmission.push(ocoStopOrderSubmission);
  } else if (formValues.takeProfit) {
    const takeProfitStopOrderSubmission = mapFormValuesToStopOrdersSubmission(
      {
        ...formValues,
        price: formValues.takeProfit,
        triggerDirection: takeProfitTriggerDirection,
        triggerType: 'price',
        triggerPrice: formValues.takeProfit,
        side: oppositeSide,
        expire: false,
        ocoTriggerType: 'price',
        type: Schema.OrderType.TYPE_MARKET,
        oco: false,
        ocoType: Schema.OrderType.TYPE_MARKET,
        ocoSize: formValues.size,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
      market.id,
      market.decimalPlaces,
      market.positionDecimalPlaces,
      isSpot(market.tradableInstrument.instrument.product),
      reference
    );
    stopOrdersSubmission.push(takeProfitStopOrderSubmission);
  } else if (formValues.stopLoss) {
    const stopLossStopOrderSubmission = mapFormValuesToStopOrdersSubmission(
      {
        ...formValues,
        triggerPrice: formValues.stopLoss,
        price: formValues.stopLoss,
        triggerDirection: stopLossTriggerDirection,
        triggerType: 'price',
        side: oppositeSide,
        expire: false,
        type: Schema.OrderType.TYPE_MARKET,
        oco: false,
        ocoTriggerType: 'price',
        ocoType: Schema.OrderType.TYPE_MARKET,
        ocoSize: formValues.size,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      },
      market.id,
      market.decimalPlaces,
      market.positionDecimalPlaces,
      isSpot(market.tradableInstrument.instrument.product),
      reference
    );
    stopOrdersSubmission.push(stopLossStopOrderSubmission);
  }

  const batchMarketInstructions = {
    submissions: [orderSubmission],
    stopOrdersSubmission,
  };
  return batchMarketInstructions;
};
