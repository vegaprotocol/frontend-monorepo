interface Asset {
  __typename?: 'Asset';
  source:
    | { __typename: 'BuiltinAsset' }
    | {
        __typename: 'ERC20';
      };
}

interface ERC20Asset {
  __typename?: 'Asset';
  source: {
    __typename: 'ERC20';
  };
}

export function isAssetTypeERC20<T extends Asset, S extends ERC20Asset>(
  asset?: T | S
): asset is S {
  if (!asset?.source) return false;
  return asset.source.__typename === 'ERC20';
}
