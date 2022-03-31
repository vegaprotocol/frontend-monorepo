import { Web3ReactProvider } from '@web3-react/core';
import type { Connectors } from './types';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
  connectors: Connectors;
}

export const Web3Provider = ({ children, connectors }: Web3ProviderProps) => {
  return (
    <Web3ReactProvider
      connectors={Object.values(connectors).map(([connector, hooks]) => {
        return [connector, hooks];
      })}
    >
      {children}
    </Web3ReactProvider>
  );
};
