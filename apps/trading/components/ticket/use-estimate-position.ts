import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { OrderType } from '@vegaprotocol/types';
import {
  useEstimatePositionQuery,
  useOpenVolume,
} from '@vegaprotocol/positions';
import { useActiveOrders } from '@vegaprotocol/orders';
import { removeDecimal } from '@vegaprotocol/utils';

import { useTicketContext } from './ticket-context';
import { useForm } from './use-form';
import { useMarkPrice } from '@vegaprotocol/markets';

export function useEstimatePosition() {
  const ticket = useTicketContext('default');
  const { pubKey } = useVegaWallet();
  const { data: markPrice } = useMarkPrice(ticket.market.id);

  const form = useForm();
  const type = form.watch('type');
  const side = form.watch('side');
  const price = form.watch('price');
  const size = form.watch('size');
  const isMarketOrder = type === OrderType.TYPE_MARKET;

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

  let armedTicketOrder;
  let derivedPrice = '0';

  if (isMarketOrder) {
    derivedPrice = markPrice || '0';
  } else if (price) {
    derivedPrice = removeDecimal(price.toString(), ticket.market.decimalPlaces);
  }

  if (size && derivedPrice) {
    armedTicketOrder = {
      isMarketOrder,
      side,
      price: derivedPrice,
      remaining: removeDecimal(
        size?.toString(),
        ticket.market.positionDecimalPlaces
      ),
    };
  }

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
    skip: !armedTicketOrder,
  });
}
