import { useOrders } from '../../hooks/use-orders';
import { OrderList } from '@vegaprotocol/order-list';
import { Splash } from '@vegaprotocol/ui-toolkit';

export const OrderListContainer = () => {
  const { orders, loading, error } = useOrders();

  if (error) {
    return <Splash>Something went wrong: {error.message}</Splash>;
  }

  if (loading) {
    return <Splash>Loading...</Splash>;
  }

  return <OrderList orders={orders} />;
};
