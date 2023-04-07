import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { WalletConnect as WalletConnectLegacy } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeUrlConnector } from './url-connector';
import { PROJECT_ID } from '../constants';
import { useWeb3ConnectStore } from './web3-connect-store';
import { theme } from '@vegaprotocol/tailwindcss-config';

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
  chainId: number,
  providerUrl: string
) =>
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        defaultChainId: chainId,
        options: {
          projectId: PROJECT_ID,
          chains: [chainId],
          showQrModal: true,
          rpcMap: {
            [chainId]: providerUrl,
          },
          qrModalOptions: {
            themeMode: 'dark',
            themeVariables: {
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
  );

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

  const [metamask, metamaskHooks] = initializeMetaMaskConnector();
  const [walletconnect, walletconnectHooks] = initializeWalletConnector(
    chainId,
    providerUrl
  );
  const [legacy, legacyHooks] = initializeWalletConnectLegacyConnector(
    chainId,
    providerUrl
  );
  const [coinbase, coinbaseHooks] = initializeCoinbaseConnector(providerUrl);

  return [
    initializeUrlConnector(localProviderUrl, walletMnemonic),
    [metamask, metamaskHooks],
    [coinbase, coinbaseHooks],
    [walletconnect, walletconnectHooks],
    [legacy, legacyHooks],
  ].filter(Boolean) as [Connector, Web3ReactHooks][];
};
