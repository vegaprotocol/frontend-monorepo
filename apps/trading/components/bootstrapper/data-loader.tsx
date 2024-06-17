import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useMarketsMapProvider } from '@vegaprotocol/markets';
import { useNetworkParams } from '@vegaprotocol/network-parameters';
import type { ReactNode } from 'react';

/**
 * Fetche necessary data on startup
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
  const {
    params,
    error: errorParams,
    loading: loadingParams,
  } = useNetworkParams();

  // Query all markets and assets to ensure they are cached
  const { data: markets, error, loading } = useMarketsMapProvider();
  const {
    data: assets,
    error: errorAssets,
    loading: loadingAssets,
  } = useAssetsMapProvider();

  if (loading || loadingAssets || loadingParams) {
    // eslint-disable-next-line
    return <>{skeleton}</>;
  }

  if (error || errorAssets || errorParams || !markets || !assets || !params) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
