import { useOrders } from '../..//hooks/use-orders';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { OrderList } from '@vegaprotocol/order-list';

export const OrderListContainer = () => {
  const { keypair } = useVegaWallet();
  const { initial, incoming } = useOrders(keypair?.pub);

  return <OrderList initial={initial} incoming={incoming} />;
};
