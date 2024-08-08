import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { HeaderStat } from '../../header';
import {
  type AssetFieldsFragment,
  useAssetDetailsDialogStore,
  AssetSymbol,
} from '@vegaprotocol/assets';
import { type HTMLAttributes } from 'react';

type AssetStatProps = HTMLAttributes<HTMLDivElement> & {
  heading: string;
  asset: AssetFieldsFragment;
};

/**
 * Asset symbol that when clicked launches the asset detail dialog
 */
export const AssetStat = ({ heading, asset, ...props }: AssetStatProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  return (
    <HeaderStat heading={heading} {...props}>
      <div>
        <AnchorButton
          onClick={(e) => {
            openAssetDetailsDialog(asset.id, e.target as HTMLElement);
          }}
        >
          <AssetSymbol asset={asset} />
        </AnchorButton>
      </div>
    </HeaderStat>
  );
};
