import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { ENV } from './config/env';

const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
);

const CHAIN_ID = Number(ENV.chainId);
const PROVIDER_URL = ENV.providerUrl as string;

if (isNaN(CHAIN_ID)) {
  throw new Error('Invalid Ethereum chain ID for environment');
}

const [walletconnect, walletconnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: {
        [CHAIN_ID]: PROVIDER_URL,
      },
    }),
  [CHAIN_ID]
);

export const Connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
  [metamask, metamaskHooks],
  [walletconnect, walletconnectHooks],
];
