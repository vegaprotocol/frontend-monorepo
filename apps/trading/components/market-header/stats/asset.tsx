import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { HeaderStat } from '../../header';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { type HTMLAttributes } from 'react';

type AssetStatProps = HTMLAttributes<HTMLDivElement> & {
  heading: string;
  asset: { id: string; symbol: string };
};

/**
 * Asset symbol that when clicked launches the asset detail dialog
 */
export const AssetStat = ({ heading, asset, ...props }: AssetStatProps) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  return (
    <HeaderStat heading={heading} {...props}>
      <div>
        <ButtonLink
          onClick={(e) => {
            openAssetDetailsDialog(asset.id, e.target as HTMLElement);
          }}
        >
          {asset.symbol}
        </ButtonLink>
      </div>
    </HeaderStat>
  );
};
