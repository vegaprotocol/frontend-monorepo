import type { Schema } from '@vegaprotocol/types';

export const isAssetTypeERC20 = (assetSource?: Partial<Schema.AssetSource>) => {
  return assetSource?.__typename === 'ERC20';
};
