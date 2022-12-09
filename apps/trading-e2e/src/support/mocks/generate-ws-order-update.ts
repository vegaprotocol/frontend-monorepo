import merge from 'lodash/merge';
import type {
  OrdersUpdateSubscription,
  OrdersUpdateSubscriptionVariables,
  OrderUpdateFieldsFragment,
} from '@vegaprotocol/orders';

import type { onMessage } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
let sendOrderUpdate: (data: OrdersUpdateSubscription) => void;
const getOnOrderUpdate = () => {
  const onOrderUpdate: onMessage<
    OrdersUpdateSubscription,
    OrdersUpdateSubscriptionVariables
  > = (send) => {
    sendOrderUpdate = send;
  };
  return onOrderUpdate;
};

export const getSubscriptionMocks = () => ({
  OrdersUpdate: getOnOrderUpdate(),
});

export function updateOrder(
  override?: PartialDeep<OrderUpdateFieldsFragment>
): void {
  const order: OrderUpdateFieldsFragment = {
    __typename: 'OrderUpdate',
    id: '1234567890',
    marketId: 'market-0',
    size: '10',
    type: Schema.OrderType.TYPE_LIMIT,
    status: Schema.OrderStatus.STATUS_FILLED,
    rejectionReason: null,
    side: Schema.Side.SIDE_BUY,
    remaining: '0',
    price: '20000000',
    timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    createdAt: new Date(2020, 1, 30).toISOString(),
    updatedAt: null,
    expiresAt: null,
    liquidityProvisionId: null,
    peggedOrder: null,
  };
  const update: OrdersUpdateSubscription = {
    orders: [merge(order, override)],
  };
  if (!sendOrderUpdate) {
    throw new Error('OrderSub not called');
  }
  sendOrderUpdate(update);
}
