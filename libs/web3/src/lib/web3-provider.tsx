import { useEffect } from 'react';
import { type Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { type Connector } from '@web3-react/types';
import { useEnvironment } from '@vegaprotocol/environment';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
  connectors: [Connector, Web3ReactHooks][];
}

export const Web3Provider = ({ children, connectors }: Web3ProviderProps) => {
  const { ETHEREUM_CHAIN_ID } = useEnvironment();

  useEffect(() => {
    // Always connect the fallback connector so we can at least
    // read from contracts
    const fallbackConnector = connectors[connectors.length - 1][0];
    fallbackConnector.activate(ETHEREUM_CHAIN_ID);
  }, [connectors, ETHEREUM_CHAIN_ID]);

  return (
    <Web3ReactProvider key="web3-provider" connectors={connectors}>
      {children}
    </Web3ReactProvider>
  );
};
