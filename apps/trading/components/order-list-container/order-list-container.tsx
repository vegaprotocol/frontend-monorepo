import { useOrders } from '../..//hooks/use-orders';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderList } from '@vegaprotocol/order-list';

export const OrderListContainer = () => {
  const res = useOrders();
  console.log(res);

  return <pre>{JSON.stringify(res, null, 2)}</pre>;
  // return <OrderList initial={initial} incoming={incoming} />;
};
