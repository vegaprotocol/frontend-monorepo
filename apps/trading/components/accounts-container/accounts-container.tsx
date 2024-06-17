import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { AccountManager } from '@vegaprotocol/accounts';
import { Links } from '../../lib/links';

export const AccountsContainer = ({
  pinnedAssets,
}: {
  pinnedAssets?: string[];
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

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
      onClickAsset={(assetId?: string) => {
        assetId && openAssetDetailsDialog(assetId);
      }}
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
