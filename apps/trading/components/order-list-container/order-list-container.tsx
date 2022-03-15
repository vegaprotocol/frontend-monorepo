import { useOrders } from '../..//hooks/use-orders';
import { Orders_party_orders } from '../../hooks/__generated__/Orders';
import { OrderSub_orders } from '../../hooks/__generated__/OrderSub';
import { ReactNode } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface OrderListContainerProps {
  children: (data: {
    initial: Orders_party_orders[];
    incoming: OrderSub_orders[];
  }) => ReactNode;
}

export const OrderListContainer = ({ children }: OrderListContainerProps) => {
  const { keypair } = useVegaWallet();
  const { initial, incoming } = useOrders(keypair?.pub);
  return <>{children({ initial, incoming })}</>;
};
