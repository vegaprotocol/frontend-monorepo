import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AssetsDocument } from './__generated__/Assets';
import { AssetStatus } from '@vegaprotocol/types';
import type { AssetsQuery } from './__generated__/Assets';
import type { Asset } from './asset-data-provider';
import { DENY_LIST } from './constants';

export interface BuiltinAssetSource {
  __typename: 'BuiltinAsset';
}

export type BuiltinAsset = Omit<Asset, 'source'> & {
  source: BuiltinAssetSource;
};

const getData = (responseData: AssetsQuery | null) =>
  responseData?.assetsConnection?.edges
    ?.filter((e) => Boolean(e?.node))
    .map((e) => e?.node as Asset) ?? [];

export const assetsProvider = makeDataProvider<
  AssetsQuery,
  Asset[],
  never,
  never
>({
  query: AssetsDocument,
  getData,
});

export const assetsMapProvider = makeDerivedDataProvider<
  Record<string, Asset>,
  never,
  undefined
>(
  [(callback, client) => assetsProvider(callback, client, undefined)],
  ([assets]) => {
    return ((assets as ReturnType<typeof getData>) || []).reduce(
      (assets, asset) => {
        assets[asset.id] = asset;
        return assets;
      },
      {} as Record<string, Asset>
    );
  }
);

/** Returns a record of assets by id */
export const useAssetsMapProvider = () =>
  useDataProvider({
    dataProvider: assetsMapProvider,
    variables: undefined,
  });

export const enabledAssetsProvider = makeDerivedDataProvider<
  ReturnType<typeof getData>,
  never
>([assetsProvider], ([assets]) =>
  (assets as ReturnType<typeof getData>)
    .filter((a) => a.status === AssetStatus.STATUS_ENABLED)
    .filter((a) => {
      const env = process.env['NX_VEGA_ENV'];

      if (!env || !DENY_LIST[env]) return true;

      if (DENY_LIST[env].includes(a.id)) {
        return false;
      }

      return true;
    })
);

/** Returns all assets */
export const useAssetsDataProvider = () =>
  useDataProvider({
    dataProvider: assetsProvider,
    variables: undefined,
  });

/** Returns assets that are enabled and are not on the deny list */
export const useEnabledAssets = () => {
  return useDataProvider({
    dataProvider: enabledAssetsProvider,
    variables: undefined,
  });
};
