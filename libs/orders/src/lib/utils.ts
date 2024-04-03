import BigNumber from 'bignumber.js';
import type { Exact } from 'type-fest';
import { type OrderAmendment } from '@vegaprotocol/wallet';
import { removeDecimal, toNanoSeconds } from '@vegaprotocol/utils';
import { type Market, type Order } from '@vegaprotocol/types';

export const normalizeOrderAmendment = <T extends Exact<OrderAmendment, T>>(
  order: Pick<Order, 'id' | 'timeInForce' | 'size' | 'expiresAt'>,
  market: Pick<Market, 'id' | 'decimalPlaces' | 'positionDecimalPlaces'>,
  price: string,
  size: string
): OrderAmendment => ({
  orderId: order.id,
  marketId: market.id,
  price: removeDecimal(price, market.decimalPlaces),
  timeInForce: order.timeInForce,
  sizeDelta: size
    ? new BigNumber(removeDecimal(size, market.positionDecimalPlaces))
        .minus(order.size)
        .toNumber()
    : 0,
  expiresAt: order.expiresAt
    ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
    : undefined,
});
