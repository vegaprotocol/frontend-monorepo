import { useWeb3ConnectStore } from './web3-connect-store';
import type { Connector } from '@web3-react/types';

export const useWeb3Disconnect = (connector: Connector) => {
  const clearError = useWeb3ConnectStore((store) => store.clearError);
  return () => {
    if (connector.deactivate) {
      connector.deactivate();
    }
    connector.resetState();
    clearError();
  };
};
