import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { OrderType, type Side } from '@vegaprotocol/types';
import {
  useEstimatePositionQuery,
  useOpenVolume,
} from '@vegaprotocol/positions';
import { useActiveOrders } from '@vegaprotocol/orders';
import { removeDecimal } from '@vegaprotocol/utils';

import { useTicketContext } from './ticket-context';
import { useForm } from './use-form';

export function useEstimatePosition() {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext();
  const form = useForm();

  const type = form.watch('type') as OrderType;
  const side = form.watch('side') as Side;
  const price = form.watch('price');
  const size = form.watch('size');

  const { openVolume, averageEntryPrice } = useOpenVolume(
    pubKey,
    ticket.market.id
  ) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  const { data: activeOrders } = useActiveOrders(pubKey, ticket.market.id);
  const orders = activeOrders
    ? activeOrders.map((order) => ({
        isMarketOrder: order.type === OrderType.TYPE_MARKET,
        price: order.price,
        remaining: order.remaining,
        side: order.side,
      }))
    : [];

  const armedTicketOrder = {
    isMarketOrder: type === OrderType.TYPE_MARKET,
    side,
    price: price ? removeDecimal(price, ticket.market.decimalPlaces) : '0',
    remaining: size
      ? removeDecimal(size, ticket.market.positionDecimalPlaces)
      : '0',
  };

  if (armedTicketOrder) {
    orders.push(armedTicketOrder);
  }

  const variables = {
    marketId: ticket.market.id,
    openVolume,
    averageEntryPrice,
    orders,
    marginAccountBalance: ticket.accounts.margin,
    generalAccountBalance: ticket.accounts.general,
    orderMarginAccountBalance: ticket.accounts.orderMargin,
    marginFactor: ticket.marginMode.factor,
    marginMode: ticket.marginMode.mode,
    includeRequiredPositionMarginInAvailableCollateral: true,
  };

  return useEstimatePositionQuery({
    variables,
    fetchPolicy: 'cache-and-network',
  });
}
