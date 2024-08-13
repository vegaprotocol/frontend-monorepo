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
          console.warn('ERR_COINBASE_WALLET', error);
          useWeb3ConnectStore.setState({ error });
        },
      })
  );

export const initializeWalletConnectLegacyConnector = (rpcMap: {
  [chainId: number]: string;
}) =>
  Object.values(rpcMap).length > 0
    ? initializeConnector<WalletConnectLegacy>(
        (actions) =>
          new WalletConnectLegacy({
            actions,
            options: {
              rpc: rpcMap,
              qrcode: true,
            },
            defaultChainId: Number(Object.keys(rpcMap)[0]),
          })
      )
    : null;

export const initializeWalletConnector = (
  projectId: string,
  rpcMap: { [chainId: number]: string }
) =>
  projectId && projectId.length > 0 && Object.values(rpcMap).length > 0
    ? initializeConnector<WalletConnect>(
        (actions) =>
          new WalletConnect({
            actions,
            defaultChainId: Number(Object.keys(rpcMap)[0]),
            options: {
              projectId: projectId,
              chains: Object.keys(rpcMap).map((id) => Number(id)),
              showQrModal: true,
              rpcMap,
              qrModalOptions: {
                themeMode: 'dark',
                themeVariables: {
                  '--wcm-z-index': '40',
                  '--wcm-accent-color': theme.colors.vega.yellow.DEFAULT,
                  '--wcm-background-color': theme.colors.gs[100],
                  '--wcm-container-border-radius': '0.25rem',
                  '--wcm-background-border-radius': '0.25rem',
                  '--wcm-accent-fill-color': theme.colors.vega.yellow.DEFAULT,
                },
              },
            },
            onError: (error) => {
              console.warn('ERR_WALLET_CONNECT', error.message);
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
          console.warn('ERR_META_MASK', error.message);
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
    initializeWalletConnector(WALLETCONNECT_PROJECT_ID, {
      [chainId]: providerUrl,
    }),
    initializeWalletConnectLegacyConnector({
      [chainId]: providerUrl,
    }),
  ].filter(Boolean) as unknown as [Connector, Web3ReactHooks][];
};

export const createMultiChainConnectors = (
  transports: { [chainId: number]: string },
  localProviderUrl?: string,
  walletMnemonic?: string
) => {
  if (Object.values(transports).length === 0) {
    throw new Error('ERR_CONNECTORS: could not create connectors');
  }

  return [
    initializeUrlConnector(localProviderUrl, walletMnemonic),
    initializeMetaMaskConnector(),
    // TODO: This needs to be tested out as it only allows single rpc connection
    // perhaps it changes to its own when switched to another chain.
    initializeCoinbaseConnector(Object.values(transports)[0]),
    initializeWalletConnector(WALLETCONNECT_PROJECT_ID, transports),
    initializeWalletConnectLegacyConnector(transports),
  ].filter(Boolean) as unknown as [Connector, Web3ReactHooks][];
};
