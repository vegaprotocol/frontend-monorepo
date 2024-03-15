import { initializeConnector, type Web3ReactHooks } from '@web3-react/core';
import { type AddEthereumChainParameter } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { WalletConnect as WalletConnectLegacy } from '@web3-react/walletconnect';
import { theme } from '@vegaprotocol/tailwindcss-config';

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}

type ChainConfig = {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation;
};

// TODO: Get these from the environment
const DEFAULT_CHAIN_ID = 1;
const MAINNET_PROVIDER_URL =
  'https://eth-mainnet.rpc.grove.city/v1/af6a2d529a11f8158bc8ca2a';
const TESTNET_PROVIDER_URL =
  'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8';
const WALLET_CONNECT_PROJECT_ID = 'fe8091dc35738863e509fc4947525c72';

const CHAINS: { [chainId: number]: ChainConfig } = {
  1: {
    urls: [MAINNET_PROVIDER_URL],
    name: 'Ethereum',
  },
  11155111: {
    urls: [TESTNET_PROVIDER_URL],
    name: 'Sepolia',
  },
};

const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{
  [chainId: number]: string[];
}>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].urls;

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }

  return accumulator;
}, {});

const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: URLS })
);

const [coinbase, coinbaseHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        appName: 'Vega',
        darkMode: true,
        url: MAINNET_PROVIDER_URL,
      },
      onError: (error) => {
        console.warn('ERR_COINBASE_WALLET', error);
      },
    })
);

const [walletConnectLegacy, walletConnectLegacyHooks] =
  initializeConnector<WalletConnectLegacy>(
    (actions) =>
      new WalletConnectLegacy({
        actions,
        options: {
          rpc: {
            1: MAINNET_PROVIDER_URL,
            11155111: TESTNET_PROVIDER_URL,
          },
          qrcode: true,
        },
        defaultChainId: DEFAULT_CHAIN_ID,
      })
  );

const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      defaultChainId: DEFAULT_CHAIN_ID,
      options: {
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [1, 11155111],
        showQrModal: true,
        rpcMap: {
          1: MAINNET_PROVIDER_URL,
          11155111: TESTNET_PROVIDER_URL,
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
        console.warn('ERR_WALLET_CONNECT', error.message);
      },
    })
);

export const fallbackConnector = network;

export const connectors: [
  MetaMask | WalletConnect | CoinbaseWallet | WalletConnectLegacy | Network,
  Web3ReactHooks
][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbase, coinbaseHooks],
  [walletConnectLegacy, walletConnectLegacyHooks],
  [network, networkHooks],
];
