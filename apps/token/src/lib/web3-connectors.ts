import { ethers } from 'ethers';
import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { Url } from './url-connector';
import type { Connector } from '@web3-react/types';
import { ENV } from '../config/env';

const [metamask, metamaskHooks] = initializeConnector<MetaMask>((actions) => {
  const instance = new MetaMask(actions);
  // @ts-ignore tag with a name so eager connect can work later
  instance.connectorName = 'MetaMask';
  return instance;
});

const [urlConnector, urlHooks] = initializeConnector<Url>(
  (actions) => new Url(actions, ENV.localProviderUrl)
);

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }
  const [walletconnect, walletconnectHooks] =
    initializeConnector<WalletConnect>(
      (actions) => {
        const instance = new WalletConnect(actions, {
          rpc: {
            [chainId]: providerUrl,
          },
        });
        // @ts-ignore tag with a name so eager connect can work later
        instance.connectorName = 'WalletConnect';
        return instance;
      },
      [chainId]
    );
  return [
    ENV.urlConnect ? [urlConnector, urlHooks] : null,
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ].filter(Boolean) as [Connector, Web3ReactHooks][];
};
