import { useLocalStorage, useLogger } from '@vegaprotocol/react-helpers';
import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Connector } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { useEffect, useRef } from 'react';
import { useWeb3ConnectStore } from './web3-connect-store';

export const ETHEREUM_EAGER_CONNECT = 'ethereum-eager-connect';

export const useEagerConnect = (sentryDsn?: string) => {
  const connectors = useWeb3ConnectStore((store) => store.connectors);
  const [eagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  const attemptedRef = useRef(false);

  const logger = useLogger({ dsn: sentryDsn });

  useEffect(() => {
    if (attemptedRef.current || 'Cypress' in window) return;

    const stored = getConnector(connectors, eagerConnector);

    const tryConnectEagerly = async () => {
      // found a valid connection option
      if (stored && stored[0].connectEagerly) {
        try {
          await stored[0].connectEagerly();
        } catch (err) {
          // NOOP - no active session
          logger.error('ERR_WEB3_EAGER_CONNECT', (err as Error).message);
        }
      }
    };
    tryConnectEagerly();

    attemptedRef.current = true;
  }, [eagerConnector, connectors, logger]);
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
