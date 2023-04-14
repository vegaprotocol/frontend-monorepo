import { ethers } from 'ethers';
import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { ENV } from '../config/env';
import {
  initializeMetaMaskConnector,
  initializeWalletConnector,
  initializeWalletConnectLegacyConnector,
  initializeCoinbaseConnector,
  UrlConnector,
  WALLETCONNECT_PROJECT_ID,
} from '@vegaprotocol/web3';

const [urlConnector, urlHooks] = initializeConnector<UrlConnector>(
  (actions) =>
    new UrlConnector(actions, ENV.localProviderUrl, ENV.ethWalletMnemonic)
);

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

const [metamask, metamaskHooks] = initializeMetaMaskConnector();

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }
  const [coinbase, coinbaseHooks] = initializeCoinbaseConnector(providerUrl);
  const [legacy, legacyHooks] = initializeWalletConnectLegacyConnector(
    chainId,
    providerUrl
  );

  return [
    ENV.urlConnect ? [urlConnector, urlHooks] : null,
    [metamask, metamaskHooks],
    [coinbase, coinbaseHooks],
    initializeWalletConnector(WALLETCONNECT_PROJECT_ID, chainId, providerUrl),
    [legacy, legacyHooks],
  ].filter(Boolean) as [Connector, Web3ReactHooks][];
};
