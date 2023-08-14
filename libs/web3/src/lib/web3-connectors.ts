import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { WalletConnect as WalletConnectLegacy } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeUrlConnector } from './url-connector';
import { WALLETCONNECT_PROJECT_ID } from './constants';
import { useWeb3ConnectStore } from './web3-connect-store';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { ethers } from 'ethers';

export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};

export const initializeCoinbaseConnector = (providerUrl: string) =>
  initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          appName: 'Vega',
          darkMode: true,
          url: providerUrl,
        },
        onError: (error) => {
          console.log('ERR_COINBASE_WALLET', error);
          useWeb3ConnectStore.setState({ error });
        },
      })
  );

export const initializeWalletConnectLegacyConnector = (
  chainId: number,
  providerUrl: string
) =>
  initializeConnector<WalletConnectLegacy>(
    (actions) =>
      new WalletConnectLegacy({
        actions,
        options: {
          rpc: {
            [chainId]: providerUrl,
          },
          qrcode: true,
        },
        defaultChainId: chainId,
      })
  );

export const initializeWalletConnector = (
  projectId: string,
  chainId: number,
  providerUrl: string
) =>
  projectId && projectId.length > 0
    ? initializeConnector<WalletConnect>(
        (actions) =>
          new WalletConnect({
            actions,
            defaultChainId: chainId,
            options: {
              projectId: projectId,
              chains: [chainId],
              showQrModal: true,
              rpcMap: {
                [chainId]: providerUrl,
              },
              qrModalOptions: {
                themeMode: 'dark',
                themeVariables: {
                  // @ts-ignore bypass theme variables ts check
                  '--w3m-z-index': '40',
                  '--w3m-accent-color': theme.colors.vega.yellow.DEFAULT,
                  '--w3m-background-color': theme.colors.vega.dark[100],
                  '--w3m-font-family': 'AlphaLyrae',
                  '--w3m-container-border-radius': '0.25rem',
                  '--w3m-background-border-radius': '0.25rem',
                  '--w3m-accent-fill-color': theme.colors.vega.yellow.DEFAULT,
                },
              },
            },
            onError: (error) => {
              console.log('ERR_WALLET_CONNECT', error.message);
              useWeb3ConnectStore.setState({ error });
            },
          })
      )
    : null;

export const initializeMetaMaskConnector = () =>
  initializeConnector<MetaMask>(
    (actions) =>
      new MetaMask({
        actions,
        options: {
          mustBeMetaMask: false,
        },
        onError: (error) => {
          console.log('ERR_META_MASK', error.message);
          useWeb3ConnectStore.setState({ error });
        },
      })
  );

export const createConnectors = (
  providerUrl: string,
  chainId: number,
  localProviderUrl?: string,
  walletMnemonic?: string
) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  return [
    initializeUrlConnector(localProviderUrl, walletMnemonic),
    initializeMetaMaskConnector(),
    initializeCoinbaseConnector(providerUrl),
    initializeWalletConnector(WALLETCONNECT_PROJECT_ID, chainId, providerUrl),
    initializeWalletConnectLegacyConnector(chainId, providerUrl),
  ].filter(Boolean) as unknown as [Connector, Web3ReactHooks][];
};
