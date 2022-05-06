import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
);

const CHAIN_ID = Number(process.env['NX_ETHEREUM_CHAIN_ID']);
const PROVIDER_URL = process.env['NX_ETHEREUM_PROVIDER_URL'] as string;

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
