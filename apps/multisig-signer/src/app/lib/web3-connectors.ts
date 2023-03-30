import { ethers } from 'ethers';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import {
  initializeMetaMaskConnector,
  initializeWalletConnector,
} from '@vegaprotocol/web3';

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

const [metamask, metamaskHooks] = initializeMetaMaskConnector();

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }
  const [walletconnect, walletconnectHooks] = initializeWalletConnector(
    chainId,
    providerUrl
  );
  return [
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ] as [Connector, Web3ReactHooks][];
};
