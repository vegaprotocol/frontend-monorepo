import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { OrderType } from '@vegaprotocol/types';
import { removeDecimal } from '@vegaprotocol/utils';

import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

import { type EstimateFeesQueryVariables } from '../__generated__/EstimateFees';

export const useEstimateFeesVariables = (
  oco: boolean,
  markPrice: string | null
): EstimateFeesQueryVariables => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext();
  const form = useForm();
  const values = form.watch();
  const positionDp = ticket.market.positionDecimalPlaces;
  const marketDp = ticket.market.decimalPlaces;

  const commonVariables = {
    marketId: ticket.market.id,
    partyId: pubKey || '',
    type: values.type,
    side: values.side,
    timeInForce: values.timeInForce,
  };

  if (values.ticketType === 'market') {
    return {
      ...commonVariables,
      size: removeDecimal(values.size?.toString(), positionDp),
      price: markPrice,
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
        : markPrice;

    if (oco) {
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
    if (oco) {
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
      size: removeDecimal(values.size?.toString() || '0', positionDp),
      price: removeDecimal(values.price?.toString(), marketDp),
    };
  }

  throw new Error('invalid ticketType');
};
