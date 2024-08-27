import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Links } from '../../lib/links';
import { AccountManager, type AssetActions } from '@vegaprotocol/accounts';

export type AccountsContainerProps = Partial<AssetActions> & {
  pinnedAssets?: string[];
  orderByBalance?: boolean;
  hideZeroBalance?: boolean;
  searchTerm?: string;
};

export const AccountsContainer = ({
  pinnedAssets,
  orderByBalance,
  hideZeroBalance,
  onClickAsset,
  onClickDeposit,
  onClickSwap,
  onClickTransfer,
  onClickWithdraw,
  searchTerm,
}: AccountsContainerProps) => {
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

  const defaultActions: AssetActions = {
    onClickAsset: (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    onClickDeposit: (assetId) => {
      navigateToAssetAction(Links.DEPOSIT(), assetId);
    },
    onClickSwap: (assetId) => {
      navigateToAssetAction(Links.SWAP(), assetId);
    },
    onClickTransfer: (assetId) => {
      navigateToAssetAction(Links.TRANSFER(), assetId);
    },
    onClickWithdraw: (assetId) => {
      navigateToAssetAction(Links.WITHDRAW(), assetId);
    },
  };

  return (
    <AccountManager
      partyId={pubKey}
      onClickAsset={onClickAsset || defaultActions.onClickAsset}
      onClickWithdraw={onClickWithdraw || defaultActions.onClickWithdraw}
      onClickDeposit={onClickDeposit || defaultActions.onClickDeposit}
      onClickTransfer={onClickTransfer || defaultActions.onClickTransfer}
      onClickSwap={onClickSwap || defaultActions.onClickSwap}
      isReadOnly={isReadOnly}
      pinnedAssets={pinnedAssets}
      orderByBalance={orderByBalance}
      hideZeroBalance={hideZeroBalance}
      searchTerm={searchTerm}
    />
  );
};
