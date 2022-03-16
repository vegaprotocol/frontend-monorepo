import { useOrders } from '../../hooks/use-orders';
import { OrderList } from '@vegaprotocol/order-list';

export const OrderListContainer = () => {
  const { orders, loading, error } = useOrders();

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return <OrderList orders={orders} />;
};
