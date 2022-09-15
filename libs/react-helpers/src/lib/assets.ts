import type { Schema } from '@vegaprotocol/types';

export const isAssetTypeERC20 = (assetSource?: Partial<Schema.AssetSource>): assetSource is Schema.ERC20 => {
  return assetSource?.__typename === 'ERC20';
};

export const isAssetTypeBuiltIn = (assetSource?: Partial<Schema.AssetSource>): assetSource is Schema.BuiltinAsset => {
  return assetSource?.__typename === 'BuiltinAsset';
};
