import type { ComponentProps } from 'react';
import Hash from '../hash';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import {
  useAssetDataProvider,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../routes/route-names';
import { EmblemWithChain } from '../../emblem-with-chain/emblem-with-chain';

export type AssetLinkProps = Partial<ComponentProps<typeof ButtonLink>> & {
  assetId: string;
  asDialog?: boolean;
  showAssetSymbol?: boolean;
  hideLabel?: boolean;
};

/**
 * Given an asset ID, it will fetch the asset name and show that,
 * with a link to the assets modal. If the name does not come back
 * it will use the ID instead.
 */
export const AssetLink = ({
  assetId,
  asDialog,
  hideLabel = false,
  showAssetSymbol = false,
  ...props
}: AssetLinkProps) => {
  const { data: asset } = useAssetDataProvider(assetId);

  const open = useAssetDetailsDialogStore((state) => state.open);
  const navigate = useNavigate();
  const label = asset
    ? showAssetSymbol
      ? asset?.symbol
      : asset?.name
    : assetId;

  return (
    <ButtonLink
      data-testid="asset-link"
      disabled={!asset}
      onClick={(e) => {
        if (asDialog) {
          open(assetId, e.target as HTMLElement);
        } else {
          navigate(`/${Routes.ASSETS}/${asset?.id}`);
        }
      }}
      {...props}
    >
      <EmblemWithChain asset={assetId} className="inline-block" />
      {hideLabel === false && (
        <div className="ml-1 inline-block">
          <Hash text={label} />
        </div>
      )}
    </ButtonLink>
  );
};
