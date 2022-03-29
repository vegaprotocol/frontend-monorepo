import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useOrders } from './use-orders';
import { OrderList } from './order-list';
import { OrderFields } from './__generated__/OrderFields';

export const OrderListContainer = () => {
  const { orders, loading, error } = useOrders();

  return (
    <AsyncRenderer<OrderFields[]> loading={loading} error={error} data={orders}>
      {(data) => <OrderList orders={data} />}
    </AsyncRenderer>
  );
};
