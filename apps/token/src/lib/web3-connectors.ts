import { ethers } from 'ethers';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

export const metamask = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions)
);

const CHAIN_ID = Number(process.env['NX_ETHEREUM_CHAIN_ID']);
const PROVIDER_URL = process.env['NX_ETHEREUM_PROVIDER_URL'] as string;

if (isNaN(CHAIN_ID)) {
  throw new Error('Invalid Ethereum chain ID for environment');
}

export const walletconnect = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: {
        [CHAIN_ID]: PROVIDER_URL,
      },
    }),
  [CHAIN_ID]
);

export const defaultProvider = new ethers.providers.InfuraProvider(
  3,
  '4f846e79e13f44d1b51bbd7ed9edefb8'
);

export const Connectors = {
  metamask,
  walletconnect,
};
