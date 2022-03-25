import { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

export type Connectors = {
  [name: string]: [Connector, Web3ReactHooks, object];
};
type Connector = MetaMask | WalletConnect;
