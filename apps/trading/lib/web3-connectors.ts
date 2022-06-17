import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
);

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }
  const [walletconnect, walletconnectHooks] =
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect(actions, {
          rpc: {
            [chainId]: providerUrl,
          },
        }),
      [chainId]
    );
  return [
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ] as [MetaMask | WalletConnect, Web3ReactHooks][];
};
