import type { Web3ReactHooks } from '@web3-react/core';
import type { MetaMask } from '@web3-react/metamask';
import type { WalletConnect } from '@web3-react/walletconnect';

export type Connectors = {
  [name: string]: [Connector, Web3ReactHooks, object];
};
type Connector = MetaMask | WalletConnect;
