import { ethers } from 'ethers';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { ENV } from '../config/env';
import {
  initializeMetaMaskConnector,
  initializeWalletConnector,
  initializeWalletConnectLegacyConnector,
  initializeCoinbaseConnector,
  WALLETCONNECT_PROJECT_ID,
  initializeUrlConnector,
} from '@vegaprotocol/web3';

initializeUrlConnector(ENV.localProviderUrl, ENV.ethWalletMnemonic);

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  return [
    ENV.urlConnect
      ? initializeUrlConnector(ENV.localProviderUrl, ENV.ethWalletMnemonic)
      : null,
    initializeMetaMaskConnector(),
    initializeCoinbaseConnector(providerUrl),
    initializeWalletConnector(WALLETCONNECT_PROJECT_ID, {
      [chainId]: providerUrl,
    }),
    initializeWalletConnectLegacyConnector({
      [chainId]: providerUrl,
    }),
  ].filter(Boolean) as unknown as [Connector, Web3ReactHooks][];
};
