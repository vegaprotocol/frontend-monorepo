import type { Web3ReactHooks } from '@web3-react/core';
import { Web3ReactProvider } from '@web3-react/core';
import type { Connector } from '@web3-react/types';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
  connectors: [Connector, Web3ReactHooks][];
}

export const Web3Provider = ({ children, connectors }: Web3ProviderProps) => {
  return (
    <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
  );
};
