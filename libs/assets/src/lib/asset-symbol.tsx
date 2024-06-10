import { ChainIdMapShort } from '../constants';
import { type AssetFieldsFragment } from './__generated__/Asset';

export const AssetSymbol = ({
  asset,
}: {
  asset: AssetFieldsFragment | undefined;
}) => {
  if (!asset) return null;

  let symbol = asset.symbol;

  if (asset.source.__typename === 'ERC20') {
    symbol = `${asset.symbol} (${ChainIdMapShort[asset.source.chainId]})`;
  }

  return symbol;
};
