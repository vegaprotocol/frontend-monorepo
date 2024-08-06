import type { AssetFieldsFragment } from '@vegaprotocol/assets';

const USDT_ARB_ID =
  '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1';

export const isAssetUSDTArb = (asset: AssetFieldsFragment) => {
  return asset.id === USDT_ARB_ID;
};
