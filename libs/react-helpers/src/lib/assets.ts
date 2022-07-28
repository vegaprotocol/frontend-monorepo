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
