import { useLocalStorage } from '@vegaprotocol/react-helpers';
import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Connector } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect';
import { useEffect, useRef } from 'react';
import { useWeb3ConnectDialog } from './web3-connect-dialog';

export const ETHEREUM_EAGER_CONNECT = 'ethereum-eager-connect';

export const useEagerConnect = () => {
  const connectors = useWeb3ConnectDialog((store) => store.connectors);
  const [eagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current || 'Cypress' in window) return;

    const stored = getConnector(connectors, eagerConnector);

    // found a valid connection option
    if (stored && stored[0].connectEagerly) {
      stored[0].connectEagerly();
    }

    attemptedRef.current = true;
  }, [eagerConnector, connectors]);
};

const getConnector = (
  connectors: [Connector, Web3ReactHooks][],
  connectorName?: string | null
) => {
  if (connectorName === 'MetaMask') {
    return connectors.find(([c]) => c instanceof MetaMask);
  }

  if (connectorName === 'WalletConnect') {
    return connectors.find(([c]) => c instanceof WalletConnect);
  }

  return null;
};
