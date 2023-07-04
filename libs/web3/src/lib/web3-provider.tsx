import { useMemo } from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import type { DefaultWeb3ProviderContextShape } from './default-web3-provider';
import { DefaultWeb3ProviderContext } from './default-web3-provider';

interface Web3ProviderProps {
  children: JSX.Element | JSX.Element[];
  connectors: [Connector, Web3ReactHooks][];
  defaultProvider?: DefaultWeb3ProviderContextShape['provider'];
}

export const Web3Provider = ({
  children,
  connectors,
  defaultProvider,
}: Web3ProviderProps) => {
  /**
   * The connectors prop passed to Web3ReactProvider must be referentially static.
   * https://github.com/Uniswap/web3-react/blob/31742897f9fddb38e00e36c2516029d3df9a9c54/packages/core/src/provider.tsx#L66
   */
  const key = useMemo(
    () => `WEB3_PROVIDER_${Date.now().toString()}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectors]
  );

  return (
    <DefaultWeb3ProviderContext.Provider value={{ provider: defaultProvider }}>
      <Web3ReactProvider key={key} connectors={connectors}>
        {children}
      </Web3ReactProvider>
    </DefaultWeb3ProviderContext.Provider>
  );
};
