import merge from 'lodash/merge';
import type {
  OrderSub as OrderSubData,
  OrderSubVariables,
  OrderSub_orders,
} from '@vegaprotocol/orders';

import type { onMessage } from '@vegaprotocol/cypress';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
let sendOrderUpdate: (data: OrderSubData) => void;
const getOnOrderSub = () => {
  const onOrderSub: onMessage<OrderSubData, OrderSubVariables> = (send) => {
    sendOrderUpdate = send;
  };
  return onOrderSub;
};

export const getSubscriptionMocks = () => ({ OrderSub: getOnOrderSub() });

export function updateOrder(override?: PartialDeep<OrderSub_orders>): void {
  const order: OrderSub_orders = {
    __typename: 'OrderUpdate',
    id: '1234567890',
    marketId: 'market-0',
    size: '10',
    type: OrderType.TYPE_LIMIT,
    status: OrderStatus.STATUS_FILLED,
    rejectionReason: null,
    side: Side.SIDE_BUY,
    remaining: '0',
    price: '20000000',
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
    createdAt: new Date(2020, 1, 30).toISOString(),
    updatedAt: null,
    expiresAt: null,
    liquidityProvisionId: null,
    peggedOrder: null,
  };
  const update: OrderSubData = {
    orders: [merge(order, override)],
  };
  if (!sendOrderUpdate) {
    throw new Error('OrderSub not called');
  }
  sendOrderUpdate(update);
}
