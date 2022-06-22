import type { ReactNode } from 'react';
import { useEagerConnect } from '@vegaprotocol/wallet';
import { NetworkLoader } from '@vegaprotocol/environment';
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
  // Get keys from vega wallet immediately
  useEagerConnect(Connectors);

  return <NetworkLoader createClient={createClient}>{children}</NetworkLoader>;
}
