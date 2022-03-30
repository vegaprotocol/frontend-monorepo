import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useOrders } from './use-orders';
import { OrderList } from './order-list';
import type { OrderFields } from './__generated__/OrderFields';

interface OrderListManagerProps {
  partyId: string;
}

export const OrderListManager = ({ partyId }: OrderListManagerProps) => {
  const { orders, loading, error } = useOrders(partyId);

  return (
    <AsyncRenderer<OrderFields[]> loading={loading} error={error} data={orders}>
      {(data) => <OrderList orders={data} />}
    </AsyncRenderer>
  );
};
