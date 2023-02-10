import { makeDataProvider, useDataProvider } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

import type { AssetQuery, AssetFieldsFragment } from './__generated__/Asset';
import { AssetDocument } from './__generated__/Asset';

export type Asset = AssetFieldsFragment;

export const getData = (responseData: AssetQuery | null | undefined) => {
  const foundAssets = responseData?.assetsConnection?.edges
    ?.filter((e) => Boolean(e?.node))
    .map((e) => e?.node as Asset);
  if (foundAssets && foundAssets?.length > 0) return foundAssets[0];
  return null;
};

export const assetProvider = makeDataProvider<AssetQuery, Asset, never, never>({
  query: AssetDocument,
  getData,
});

export const useAssetDataProvider = (assetId: string) => {
  const variables = useMemo(
    () => ({
      assetId,
    }),
    [assetId]
  );
  return useDataProvider({
    dataProvider: assetProvider,
    variables,
    skip: !assetId,
  });
};
