import { useWeb3React } from '@web3-react/core';

export const useWeb3Disconnect = () => {
  const { connector } = useWeb3React();
  return () => {
    if (connector.deactivate) {
      connector.deactivate();
    }
    connector.resetState();
  };
};
