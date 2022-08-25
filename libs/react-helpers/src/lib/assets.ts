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

interface AssetEdge {
  __typename: 'AssetEdge';
  node: Asset;
}

interface AssetsConnection {
  __typename: 'AssetsConnection';
  edges: (AssetEdge | null)[] | null;
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

export const assetsConnectionToAssets = (
  assetsConnection: AssetsConnection | undefined | null
): Asset[] => {
  const edges = assetsConnection?.edges?.filter((e) => e && e?.node);
  if (!edges) return [];

  return (edges as AssetEdge[]).map((e) => e.node);
};
