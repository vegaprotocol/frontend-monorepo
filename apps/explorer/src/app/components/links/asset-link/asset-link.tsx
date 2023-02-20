import type { ComponentProps } from 'react';
import Hash from '../hash';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import {
  useAssetDataProvider,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../routes/route-names';

export type AssetLinkProps = Partial<ComponentProps<typeof ButtonLink>> & {
  assetId: string;
  asDialog?: boolean;
};

/**
 * Given an asset ID, it will fetch the asset name and show that,
 * with a link to the assets modal. If the name does not come back
 * it will use the ID instead.
 */
export const AssetLink = ({ assetId, asDialog, ...props }: AssetLinkProps) => {
  const { data: asset } = useAssetDataProvider(assetId);

  const open = useAssetDetailsDialogStore((state) => state.open);
  const navigate = useNavigate();
  const label = asset?.name ? asset.name : assetId;
  return (
    <ButtonLink
      data-testid="asset-link"
      disabled={!asset}
      onClick={(e) => {
        if (asDialog) {
          open(assetId, e.target as HTMLElement);
        } else {
          navigate(`${Routes.ASSETS}/${asset?.id}`);
        }
      }}
      {...props}
    >
      <Hash text={label} />
    </ButtonLink>
  );
};
