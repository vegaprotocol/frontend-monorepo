import { ethers } from 'ethers';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import {
  initializeMetaMaskConnector,
  initializeWalletConnector,
} from '@vegaprotocol/web3';
import { ENV } from '../config/env';

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

export const createConnectors = (providerUrl: string, chainId: number) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  return [
    initializeMetaMaskConnector(),
    initializeWalletConnector(
      ENV.WALLETCONNECT_PROJECT_ID,
      chainId,
      providerUrl
    ),
  ].filter(Boolean) as unknown as [Connector, Web3ReactHooks][];
};
