import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const PartyActiveOrdersHandler = () => {
  const { pubKey } = useVegaWallet();
  useActiveOrders(pubKey);
  return null;
};
