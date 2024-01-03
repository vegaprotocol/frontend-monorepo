import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useMarketsMapProvider } from '@vegaprotocol/markets';
import type { ReactNode } from 'react';

export const DataLoader = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  // Query all markets and assets to ensure they are cached
  const { data: markets, error, loading } = useMarketsMapProvider();
  const {
    data: assets,
    error: errorAssets,
    loading: loadingAssets,
  } = useAssetsMapProvider();

  if (loading || loadingAssets) {
    // eslint-disable-next-line
    return <>{skeleton}</>;
  }

  if (error || errorAssets || !markets || !assets) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
