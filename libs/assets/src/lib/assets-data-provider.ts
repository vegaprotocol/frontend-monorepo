import { makeDataProvider, makeDerivedDataProvider } from '@vegaprotocol/utils';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AssetsDocument } from './__generated__/Assets';
import * as Schema from '@vegaprotocol/types';
import type { AssetsQuery } from './__generated__/Assets';
import type { Asset } from './asset-data-provider';

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

export const enabledAssetsProvider = makeDerivedDataProvider<
  ReturnType<typeof getData>,
  never
>([assetsProvider], ([assets]) =>
  (assets as ReturnType<typeof getData>).filter(
    (a) => a.status === Schema.AssetStatus.STATUS_ENABLED
  )
);

export const useAssetsDataProvider = () =>
  useDataProvider({
    dataProvider: assetsProvider,
    variables: undefined,
  });
