import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useEagerConnect } from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/network-switcher';
import { Connectors } from '../../lib/vega-connectors';
import { createClient } from '../../lib/apollo-client';

interface AppLoaderProps {
  children: ReactNode;
}

/**
 * Component to handle any app initialization, startup queries and other things
 * that must happen for it can be used
 */
export function AppLoader({ children }: AppLoaderProps) {
  const { VEGA_URL } = useEnvironment();

  // Get keys from vega wallet immediately
  useEagerConnect(Connectors);
  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient(VEGA_URL);
    }
  }, [VEGA_URL]);

  return !client ? (
    <div>Loading...</div>
  ) : (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
}
