import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { PinnedAsset } from '@vegaprotocol/accounts';
import { AccountManager } from '@vegaprotocol/accounts';
import { Links } from '../../lib/links';

export const AccountCardContainer = ({ assetId }: { assetId: string }) => {};

export const AccountsContainer = ({
  pinnedAssets,
}: {
  pinnedAssets?: PinnedAsset[];
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const onClickAsset = useCallback(
    (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    [openAssetDetailsDialog]
  );

  const navigateToAssetAction = (path: string, assetId: string | undefined) => {
    let params = '';
    if (assetId) {
      searchParams.append('assetId', assetId);
      params = `?${searchParams.toString()}`;
    }
    navigate(path + params);
  };

  return (
    <AccountManager
      partyId={pubKey}
      onClickAsset={onClickAsset}
      onClickWithdraw={(assetId) =>
        navigateToAssetAction(Links.WITHDRAW(), assetId)
      }
      onClickDeposit={(assetId) =>
        navigateToAssetAction(Links.DEPOSIT(), assetId)
      }
      onClickTransfer={(assetId) =>
        navigateToAssetAction(Links.TRANSFER(), assetId)
      }
      isReadOnly={isReadOnly}
      pinnedAssets={pinnedAssets}
    />
  );
};
