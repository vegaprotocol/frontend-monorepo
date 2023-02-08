import type { ComponentProps } from 'react';
import Hash from '../hash';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import {
  useAssetDataProvider,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';

export type AssetLinkProps = Partial<ComponentProps<typeof ButtonLink>> & {
  assetId: string;
};

/**
 * Given an asset ID, it will fetch the asset name and show that,
 * with a link to the assets list. If the name does not come back
 * it will use the ID instead.
 */
export const AssetLink = ({ assetId, ...props }: AssetLinkProps) => {
  const { data: asset } = useAssetDataProvider(assetId);

  const open = useAssetDetailsDialogStore((state) => state.open);
  const label = asset?.name ? asset.name : assetId;
  return (
    <ButtonLink
      data-testid="asset-link"
      disabled={!asset}
      onClick={(e) => {
        open(assetId, e.target as HTMLElement);
      }}
      {...props}
    >
      <Hash text={label} />
    </ButtonLink>
  );
};
