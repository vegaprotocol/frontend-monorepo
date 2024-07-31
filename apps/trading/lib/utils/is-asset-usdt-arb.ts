import type { AssetFieldsFragment } from '@vegaprotocol/assets';

const USDT_ARB_ID =
  '29eef0c7fa049e9a866629a23554866313e4cc15a61fb43656e275547a10d305';

export const isAssetUSDTArb = (asset: AssetFieldsFragment) => {
  return asset.id === USDT_ARB_ID;
};
