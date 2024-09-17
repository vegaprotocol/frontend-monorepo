import { OrderType } from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/utils';

import { type EstimateFeesQueryVariables } from '../__generated__/EstimateFees';
import { type FormFields } from '../schemas';

export type UseEstimateFeesVariablesArgs = {
  partyId: string | undefined;
  useOcoFields: boolean;
  markPrice: string | null;
  values: FormFields;
  market: {
    id: string;
    decimalPlaces: number;
    positionDecimalPlaces: number;
  };
};

/**
 * Take current market and fields from the deal ticket and create
 * variables suitable for an estimated fee query
 */
export const useEstimateFeesVariables = (
  args: UseEstimateFeesVariablesArgs
): EstimateFeesQueryVariables => {
  const values = args.values;
  const positionDp = args.market.positionDecimalPlaces;
  const marketDp = args.market.decimalPlaces;

  const commonVariables = {
    marketId: args.market.id,
    partyId: args.partyId || '',
    type: values.type,
    side: values.side,
    timeInForce: values.timeInForce,
  };

  if (values.ticketType === 'market') {
    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString(), positionDp),
      price: args.markPrice,
    };
  }

  if (values.ticketType === 'limit') {
    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString(), positionDp),
      price: removeDecimal(values.price?.toString(), marketDp),
    };
  }

  if (values.ticketType === 'stopMarket') {
    // Use the trigger price as the order will
    // submit at that price, so it will be more accurate
    // to use the price then rather than any current price
    const price =
      values.ocoTriggerType === 'price'
        ? removeDecimal(values.triggerPrice?.toString(), marketDp)
        : args.markPrice;

    if (args.useOcoFields) {
      if (!values.ocoTimeInForce) {
        throw new Error('ocoTimeInForce required for fees estimate');
      }

      return {
        ...commonVariables,
        type: OrderType.TYPE_MARKET,
        size: removeDecimal(values.ocoSize?.toString() || '0', positionDp),
        price,
        timeInForce: values.ocoTimeInForce,
      };
    }

    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString() || '0', positionDp),
      price,
    };
  }

  if (values.ticketType === 'stopLimit') {
    if (args.useOcoFields) {
      if (!values.ocoTimeInForce) {
        throw new Error('ocoTimeInForce required for fees estimate');
      }

      return {
        ...commonVariables,
        type: OrderType.TYPE_LIMIT,
        size: removeDecimal(values.ocoSize?.toString() || '0', positionDp),
        price: removeDecimal(values.ocoPrice?.toString() || '0', marketDp),
        timeInForce: values.ocoTimeInForce,
      };
    }

    return {
      ...commonVariables,
      type: OrderType.TYPE_LIMIT,
      size: removeDecimal(values.size?.toString() || '0', positionDp),
      price: removeDecimal(values.price?.toString(), marketDp),
    };
  }

  throw new Error('invalid ticketType');
};
