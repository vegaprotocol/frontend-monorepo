import { useMarkets, useAssets } from '@vegaprotocol/data-provider';
import { useNetworkParams } from '@vegaprotocol/network-parameters';
import type { ReactNode } from 'react';

/**
 * Fetch necessary data on startup
 */
export const DataLoader = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  // Query all network params, markets and assets, for quick
  // access throughout the app
  const { error: errorParams, loading: loadingParams } = useNetworkParams();

  const { status: statusAssets } = useAssets();
  const { status: statusMarkets } = useMarkets();

  if (
    loadingParams ||
    [statusAssets, statusMarkets].some((s) => s === 'pending')
  ) {
    return <>{skeleton}</>;
  }

  if (errorParams || [statusAssets, statusMarkets].some((s) => s === 'error')) {
    return <>{failure}</>;
  }

  return <>{children}</>;
};
