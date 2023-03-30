import type { Web3ReactHooks } from '@web3-react/core';
import { Web3ReactProvider } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { useMemo } from 'react';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
  connectors: [Connector, Web3ReactHooks][];
}

export const Web3Provider = ({ children, connectors }: Web3ProviderProps) => {
  const key = useMemo(
    () => `WEB3_PROVIDER_${Date.now().toString()}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectors]
  );

  return (
    <Web3ReactProvider key={key} connectors={connectors}>
      {children}
    </Web3ReactProvider>
  );
};
