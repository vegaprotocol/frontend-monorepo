import { useCallback } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useWithdrawalDialog } from '@vegaprotocol/withdraws';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountManager, useTransferDialog } from '@vegaprotocol/accounts';
import { useDepositDialog } from '@vegaprotocol/deposits';

export const AccountsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const openWithdrawalDialog = useWithdrawalDialog((store) => store.open);
  const openDepositDialog = useDepositDialog((store) => store.open);
  const openTransferDialog = useTransferDialog((store) => store.open);

  const onClickAsset = useCallback(
    (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    [openAssetDetailsDialog]
  );

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <div className="h-full relative grid grid-rows-[1fr,min-content]">
      <div>
        <AccountManager
          partyId={pubKey}
          onClickAsset={onClickAsset}
          onClickWithdraw={openWithdrawalDialog}
          onClickDeposit={openDepositDialog}
          isReadOnly={isReadOnly}
        />
      </div>
      {!isReadOnly && (
        <div className="flex gap-2 justify-end p-2 px-[11px]">
          <Button
            size="sm"
            data-testid="open-transfer-dialog"
            onClick={() => openTransferDialog()}
          >
            {t('Transfer')}
          </Button>
          <Button size="sm" onClick={() => openDepositDialog()}>
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};
