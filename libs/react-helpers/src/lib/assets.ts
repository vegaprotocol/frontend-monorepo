export interface ERC20AssetSource {
  __typename: 'ERC20';
  contractAddress: string;
}

export interface BuiltinAssetSource {
  __typename: 'BuiltinAsset';
}

export interface Asset {
  __typename: 'Asset';
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  source: ERC20AssetSource | BuiltinAssetSource;
}

export enum AssetStatus {
  STATUS_ENABLED = 'STATUS_ENABLED',
  STATUS_PENDING_LISTING = 'STATUS_PENDING_LISTING',
  STATUS_PROPOSED = 'STATUS_PROPOSED',
  STATUS_REJECTED = 'STATUS_REJECTED',
}

export interface AssetWithStatus extends Asset {
  status: AssetStatus;
}

export type ERC20Asset = Omit<Asset, 'source'> & {
  source: ERC20AssetSource;
};

export type BuiltinAsset = Omit<Asset, 'source'> & {
  source: BuiltinAssetSource;
};

export const isAssetTypeERC20 = (asset?: Asset): asset is ERC20Asset => {
  if (!asset?.source) return false;
  return asset.source.__typename === 'ERC20';
};

type AssetEdge<T extends Asset> = {
  __typename: 'AssetEdge';
  node: T;
};

type AssetsConnection<T extends Asset> = {
  assetsConnection: {
    edges: (AssetEdge<T> | null)[] | null;
  };
};

export const getAssets = (data?: AssetsConnection<Asset>): Asset[] =>
  data?.assetsConnection?.edges
    ?.filter((e) => e && e?.node)
    .map((e) => (e as AssetEdge<Asset>).node as Asset) || [];

export const getEnabledAssets = (
  data?: AssetsConnection<AssetWithStatus>
): Asset[] =>
  data?.assetsConnection?.edges
    ?.filter((e) => e && e?.node)
    .map((e) => (e as AssetEdge<AssetWithStatus>).node)
    .filter((a) => a.status === AssetStatus.STATUS_ENABLED) || [];
