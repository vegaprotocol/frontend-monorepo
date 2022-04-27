import type { AssetFields } from './__generated__/AssetFields';

export interface ERC20Asset extends AssetFields {
  source: {
    __typename: 'ERC20';
    contractAddress: string;
  };
}

// Type guard to ensure an asset is an ERC20 token
export const isERC20Asset = (asset: AssetFields): asset is ERC20Asset => {
  if (asset.source.__typename === 'ERC20') {
    return true;
  }
  return false;
};
