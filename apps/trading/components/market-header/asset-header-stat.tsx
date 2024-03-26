import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { HeaderStat } from '../header';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { type HTMLAttributes } from 'react';

type AssetHeaderStatProps = HTMLAttributes<HTMLDivElement> & {
  heading: string;
  asset: { id: string; symbol: string };
};

export const AssetHeaderStat = ({
  heading,
  asset,
  ...props
}: AssetHeaderStatProps) => {
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
