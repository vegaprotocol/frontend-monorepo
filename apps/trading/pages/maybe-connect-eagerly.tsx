import { useEagerConnect as useVegaEagerConnect } from '@vegaprotocol/wallet-react';
import { useEagerConnect as useEthereumEagerConnect } from '@vegaprotocol/web3';
import { connectors } from '../lib/web3-connectors';

export const MaybeConnectEagerly = () => {
  useEthereumEagerConnect({ connectors });
  useVegaEagerConnect();

  return null;
};
