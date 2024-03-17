import { useWeb3React } from '@web3-react/core';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { CONNECTOR_STORAGE_KEY } from './constants';

export const useWeb3Disconnect = () => {
  const [, , removeEagerConnector] = useLocalStorage(CONNECTOR_STORAGE_KEY);
  const { connector } = useWeb3React();
  return () => {
    if (connector.deactivate) {
      connector.deactivate();
    }

    connector.resetState();

    removeEagerConnector();
  };
};
