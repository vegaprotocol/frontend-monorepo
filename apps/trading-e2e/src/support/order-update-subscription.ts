import type {
  OrdersUpdateSubscription,
  OrdersUpdateSubscriptionVariables,
  OrderUpdateFieldsFragment,
} from '@vegaprotocol/orders';
import type { onMessage } from '@vegaprotocol/cypress';
import type { PartialDeep } from 'type-fest';
import { orderUpdateSubscription } from '@vegaprotocol/mock';

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
  const update: OrdersUpdateSubscription = orderUpdateSubscription({
    orders: [override],
  });
  if (!sendOrderUpdate) {
    throw new Error('OrderSub not called');
  }
  sendOrderUpdate(update);
}
