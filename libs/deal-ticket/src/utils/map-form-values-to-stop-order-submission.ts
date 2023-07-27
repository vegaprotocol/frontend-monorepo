import type {
  StopOrderSetup,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import { normalizeOrderSubmission } from '@vegaprotocol/wallet';
import type { StopOrderFormValues } from '../hooks/use-stop-order-form-values';
import * as Schema from '@vegaprotocol/types';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';

export const mapFormValuesToStopOrdersSubmission = (
  data: StopOrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {};
  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: normalizeOrderSubmission(
      {
        marketId,
        type: data.type,
        side: data.side,
        size: data.size,
        timeInForce: data.timeInForce,
        price: data.price,
        reduceOnly: true,
      },
      decimalPlaces,
      positionDecimalPlaces
    ),
  };
  if (data.triggerType === 'price') {
    stopOrderSetup.price = removeDecimal(data.triggerPrice, decimalPlaces);
  } else if (data.triggerType === 'trailingPercentOffset') {
    stopOrderSetup.trailingPercentOffset = (
      Number(data.triggerTrailingPercentOffset) / 100
    ).toFixed(3);
  }

  if (data.expire) {
    stopOrderSetup.expiresAt = data.expiresAt && toNanoSeconds(data.expiresAt);
    if (data.expiryStrategy === 'cancel') {
      stopOrderSetup.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
    } else if (data.expiryStrategy === 'submit') {
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
