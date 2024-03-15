import { useEffect } from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { connectors, fallbackConnector } from './connectors';
import { useEnvironment } from '@vegaprotocol/environment';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const { ETHEREUM_CHAIN_ID } = useEnvironment();
  useEffect(() => {
    // Always connect the fallback connector so we can at least
    // read from contracts
    fallbackConnector.activate(ETHEREUM_CHAIN_ID);
  }, []);

  return (
    <Web3ReactProvider key="web3-provider" connectors={connectors}>
      {children}
    </Web3ReactProvider>
  );
};
