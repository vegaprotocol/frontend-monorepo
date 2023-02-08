import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { initializeUrlConnector } from './url-connector';

export const createConnectors = (
  providerUrl: string,
  chainId: number,
  localProviderUrl?: string,
  walletMnemonic?: string
) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
    (actions) => new MetaMask(actions)
  );

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
    initializeUrlConnector(localProviderUrl, walletMnemonic),
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ].filter(Boolean) as [Connector, Web3ReactHooks][];
};
