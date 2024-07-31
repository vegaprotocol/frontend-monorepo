import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  ARBITRUM_CHAIN_ID,
  ARBITRUM_SEPOLIA_CHAIN_ID,
} from '@vegaprotocol/web3';

export const isAssetUSDTArb = (asset: AssetFieldsFragment) => {
  const source = asset.source.__typename === 'ERC20' ? asset.source : undefined;
  return (
    asset.symbol.toLowerCase() === 'usdt' &&
    (source?.chainId === String(ARBITRUM_CHAIN_ID) ||
      source?.chainId === String(ARBITRUM_SEPOLIA_CHAIN_ID))
  );
};
