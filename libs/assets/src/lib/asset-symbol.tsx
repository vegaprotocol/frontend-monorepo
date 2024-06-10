import { type AssetFieldsFragment } from './__generated__/Asset';
import { type ChainId, ChainIdMapShort } from '@vegaprotocol/web3';

export const AssetSymbol = ({
  asset,
}: {
  asset: AssetFieldsFragment | undefined;
}) => {
  if (!asset) return null;

  let symbol = asset.symbol;

  if (asset.source.__typename === 'ERC20') {
    symbol = `${asset.symbol} (${
      ChainIdMapShort[asset.source.chainId as unknown as ChainId]
    })`;
  }

  return symbol;
};
