import { useEagerConnect } from '@vegaprotocol/wallet';
import { Connectors } from '../../lib/vega-connectors';
import type { ReactNode } from 'react';

interface AppLoaderProps {
  children: ReactNode;
}

/**
 * Component to handle any app initialization, startup querys and other things
 * that must happen for it can be used
 */
export function AppLoader({ children }: AppLoaderProps) {
  // Get keys from vega wallet immediately
  useEagerConnect(Connectors);

  return <>{children}</>;
}
