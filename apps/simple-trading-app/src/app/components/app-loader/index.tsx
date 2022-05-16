import { useEagerConnect } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { Connectors } from '../../lib/vega-connectors';

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

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
