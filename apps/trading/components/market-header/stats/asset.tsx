import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { HeaderStat } from '../../header';
import {
  type AssetFieldsFragment,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { type HTMLAttributes } from 'react';
import { type ChainId, ChainIdMapShort } from '@vegaprotocol/web3';

type AssetStatProps = HTMLAttributes<HTMLDivElement> & {
  heading: string;
  asset: AssetFieldsFragment;
};

/**
 * Asset symbol that when clicked launches the asset detail dialog
 */
export const AssetStat = ({ heading, asset, ...props }: AssetStatProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  let symbol = asset.symbol;

  if (asset.source.__typename === 'ERC20') {
    symbol = `${asset.symbol} (${
      ChainIdMapShort[asset.source.chainId as unknown as ChainId]
    })`;
  }

  return (
    <HeaderStat heading={heading} {...props}>
      <div>
        <ButtonLink
          onClick={(e) => {
            openAssetDetailsDialog(asset.id, e.target as HTMLElement);
          }}
        >
          {symbol}
        </ButtonLink>
      </div>
    </HeaderStat>
  );
};
