import type {
  OrderSubmission,
  StopOrderSetup,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import type {
  OrderFormValues,
  StopOrderFormValues,
} from '../hooks/use-form-values';
import * as Schema from '@vegaprotocol/types';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';

export const mapFormValuesToOrderSubmission = (
  order: OrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number
): OrderSubmission => ({
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
    order.type === Schema.OrderType.TYPE_MARKET ? false : order.postOnly,
  reduceOnly:
    order.type === Schema.OrderType.TYPE_LIMIT &&
    ![
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    ].includes(order.timeInForce)
      ? false
      : order.reduceOnly,
  icebergOpts:
    (order.type === Schema.OrderType.TYPE_MARKET ||
      [
        Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
        Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      ].includes(order.timeInForce)) &&
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

export const mapFormValuesToStopOrdersSubmission = (
  data: StopOrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {};
  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: mapFormValuesToOrderSubmission(
      {
        type: data.type,
        side: data.side,
        size: data.size,
        timeInForce: data.timeInForce,
        price: data.price,
        reduceOnly: true,
      },
      marketId,
      decimalPlaces,
      positionDecimalPlaces
    ),
  };
  if (data.triggerType === 'price') {
    stopOrderSetup.price = removeDecimal(
      data.triggerPrice ?? '',
      decimalPlaces
    );
  } else if (data.triggerType === 'trailingPercentOffset') {
    stopOrderSetup.trailingPercentOffset = (
      Number(data.triggerTrailingPercentOffset) / 100
    ).toFixed(3);
  }

  if (data.expire) {
    stopOrderSetup.expiresAt = data.expiresAt && toNanoSeconds(data.expiresAt);
    if (
      data.expiryStrategy ===
      Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS
    ) {
      stopOrderSetup.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
    } else if (
      data.expiryStrategy ===
      Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT
    ) {
      stopOrderSetup.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT;
    }
  }

  if (
    data.triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
  ) {
    submission.risesAbove = stopOrderSetup;
  }
  if (
    data.triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
  ) {
    submission.fallsBelow = stopOrderSetup;
  }

  return submission;
};
