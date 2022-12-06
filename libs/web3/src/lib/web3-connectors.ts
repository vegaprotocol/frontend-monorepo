import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  const [metamask, metamaskHooks] = initializeConnector<MetaMask>((actions) => {
    const instance = new MetaMask(actions);
    // @ts-ignore tag connector with a name so we can match up by string
    instance.connectorName = 'MetaMask';
    return instance;
  });

  const [walletconnect, walletconnectHooks] =
    initializeConnector<WalletConnect>(
      (actions) => {
        const instance = new WalletConnect(actions, {
          rpc: {
            [chainId]: providerUrl,
          },
        });
        // @ts-ignore tag connector with a name so we can match up by string
        instance.connectorName = 'WalletConnect';
        return instance;
      },
      [chainId]
    );
  return [
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ] as [MetaMask | WalletConnect, Web3ReactHooks][];
};
