import { makeDataProvider, useDataProvider } from '@vegaprotocol/data-provider';

import {
  type AssetQuery,
  type AssetQueryVariables,
  type AssetFieldsFragment,
} from './__generated__/Asset';
import { AssetDocument } from './__generated__/Asset';

export type Asset = AssetFieldsFragment;

export const getData = (responseData: AssetQuery | null | undefined) => {
  const foundAssets = responseData?.assetsConnection?.edges
    ?.filter((e) => Boolean(e?.node))
    .map((e) => e?.node as Asset);
  if (foundAssets && foundAssets?.length > 0) return foundAssets[0];
  return null;
};

export const assetProvider = makeDataProvider<
  AssetQuery,
  Asset,
  never,
  never,
  AssetQueryVariables
>({
  query: AssetDocument,
  getData,
});

export const useAssetDataProvider = (assetId: string, skip?: boolean) => {
  return useDataProvider({
    dataProvider: assetProvider,
    variables: { assetId: assetId || '' },
    skip: !assetId || skip,
  });
};
