import type { Web3ReactHooks } from '@web3-react/core';
import { initializeConnector } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { initializeUrlConnector } from './url-connector';
import { PROJECT_ID } from '../constansts';
import { useWeb3ConnectStore } from './web3-connect-store';

export const initializeWalletConnector = (
  chainId: number,
  providerUrl: string
) =>
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        options: {
          projectId: PROJECT_ID,
          chains: [chainId],
          showQrModal: true,
          rpcMap: {
            [chainId]: providerUrl,
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
        onError: (error) => {
          console.log('ERR_META_MASK', error.message);
          useWeb3ConnectStore.setState({ error });
        },
      })
  );

const [metamask, metamaskHooks] = initializeMetaMaskConnector();

export const createConnectors = (
  providerUrl: string,
  chainId: number,
  localProviderUrl?: string,
  walletMnemonic?: string
) => {
  if (isNaN(chainId)) {
    throw new Error('Invalid Ethereum chain ID for environment');
  }

  const [walletconnect, walletconnectHooks] = initializeWalletConnector(
    chainId,
    providerUrl
  );

  return [
    initializeUrlConnector(localProviderUrl, walletMnemonic),
    [metamask, metamaskHooks],
    [walletconnect, walletconnectHooks],
  ].filter(Boolean) as [Connector, Web3ReactHooks][];
};
