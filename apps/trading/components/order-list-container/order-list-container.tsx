import { useOrders } from '../../hooks/use-orders';
import { OrderList } from '@vegaprotocol/order-list';
import { AsyncRenderer } from '../async-renderer';
import { OrderFields } from '@vegaprotocol/graphql';

export const OrderListContainer = () => {
  const { orders, loading, error } = useOrders();

  return (
    <AsyncRenderer<OrderFields[]> loading={loading} error={error} data={orders}>
      {(data) => <OrderList orders={data} />}
    </AsyncRenderer>
  );
};
