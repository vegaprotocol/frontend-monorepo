import { initializeConnector, type Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { WalletConnect as WalletConnectLegacy } from '@web3-react/walletconnect';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { ENV } from '@vegaprotocol/environment';

interface BasicChainInformation {
  urls: string[];
  name: string;
}

// TODO: figure out how to use blockExplorerUrls
// interface ExtendedChainInformation extends BasicChainInformation {
//   nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
//   blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
// }

type ChainConfig = {
  [chainId: number]: BasicChainInformation;
};

export const createConnectors = () => {
  if (!ENV) return [];
  if (!ENV.ETHEREUM_RPC_URLS) return [];
  if (!ENV.WALLETCONNECT_PROJECT_ID) return [];

  const CHAINS: ChainConfig = {
    1: {
      urls: [ENV.ETHEREUM_RPC_URLS['1']],
      name: 'Ethereum',
    },
    11155111: {
      urls: [ENV.ETHEREUM_RPC_URLS['11155111']],
      name: 'Sepolia',
    },
    1440: {
      urls: [ENV.ETHEREUM_RPC_URLS['1440']],
      name: 'Local',
    },
  };

  const URLS = Object.keys(CHAINS).reduce((acc, chainId) => {
    const validURLs = CHAINS[Number(chainId)].urls;

    if (validURLs.length) {
      acc[Number(chainId)] = validURLs;
    }

    return acc;
  }, {} as { [chainId: number]: string[] });

  //  This is the fallback connector and should be last in the connectors array
  const [network, networkHooks] = initializeConnector<Network>((actions) => {
    return new Network({ actions, urlMap: URLS });
  });

  const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
    (actions) => new MetaMask({ actions })
  );

  const [coinbase, coinbaseHooks] = initializeConnector<CoinbaseWallet>(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          appName: 'Vega',
          darkMode: true,
          // Default to mainnet if ETHEREUM_CHAIN_ID is not set, which can be
          // the case in many unit tests
          url: ENV.ETHEREUM_CHAIN_ID
            ? CHAINS[ENV.ETHEREUM_CHAIN_ID].urls[0]
            : CHAINS[1].urls[0],
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
            rpc: URLS,
            qrcode: true,
          },
          defaultChainId: ENV.ETHEREUM_CHAIN_ID,
        })
    );

  const [walletConnect, walletConnectHooks] =
    initializeConnector<WalletConnect>(
      (actions) =>
        new WalletConnect({
          actions,
          defaultChainId: ENV.ETHEREUM_CHAIN_ID,
          options: {
            projectId: ENV.WALLETCONNECT_PROJECT_ID as string,
            chains: [1, 11155111],
            showQrModal: true,
            rpcMap: URLS,
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

  const connectors: [
    MetaMask | WalletConnect | CoinbaseWallet | WalletConnectLegacy | Network,
    Web3ReactHooks
  ][] = [
    [metaMask, metaMaskHooks],
    [walletConnect, walletConnectHooks],
    [coinbase, coinbaseHooks],
    [walletConnectLegacy, walletConnectLegacyHooks],
    [network, networkHooks],
  ];

  return connectors;
};
