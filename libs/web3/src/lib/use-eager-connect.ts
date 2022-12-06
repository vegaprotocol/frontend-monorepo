import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';

export const useEagerConnect = () => {
  const { connector } = useWeb3React();
  useEffect(() => {
    if (connector?.connectEagerly && !('Cypress' in window)) {
      connector.connectEagerly();
    }
    // wallet connect doesnt handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
