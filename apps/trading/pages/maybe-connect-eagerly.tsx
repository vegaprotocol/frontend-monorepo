import { useEagerConnect as useVegaEagerConnect } from '@vegaprotocol/wallet-react';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';

export const MaybeConnectEagerly = () => {
  useEthereumEagerConnect();
  useVegaEagerConnect();

  return null;
};
