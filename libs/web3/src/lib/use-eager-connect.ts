import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useEffect, useRef } from 'react';
import { useWeb3ConnectDialog } from './web3-connect-dialog';

export const ETHEREUM_EAGER_CONNECT = 'ethereum-eager-connect';

export const useEagerConnect = () => {
  const connectors = useWeb3ConnectDialog((store) => store.connectors);
  const [eagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current || 'Cypress' in window) return;
    console.log('attempt connect with', eagerConnector);

    const option = connectors.find(([c]) => {
      // @ts-ignore connector class has connectName added at init
      // web3-connectors.ts
      return c.connectorName === eagerConnector;
    });

    // found a valid connection option
    if (option && option[0]?.connectEagerly) {
      option[0].connectEagerly();
    }

    attemptedRef.current = true;
  }, [eagerConnector, connectors]);
};
