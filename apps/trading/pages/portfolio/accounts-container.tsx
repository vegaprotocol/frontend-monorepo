import { useCallback, useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountManager } from '@vegaprotocol/accounts';
import { DepositDialog } from '@vegaprotocol/deposits';

export const AccountsContainer = () => {
  const { pubKey } = useVegaWallet();
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const [assetId, setAssetId] = useState<string>();

  const onClickAsset = useCallback(
    (value?: string | AssetFieldsFragment) => {
      value && openAssetDetailsDialog(value);
    },
    [openAssetDetailsDialog]
  );

  const onClickWithdraw = useCallback((assetId?: string) => {
    setWithdrawDialog(true);
    setAssetId(assetId);
  }, []);

  const onClickDeposit = useCallback((assetId?: string) => {
    setDepositDialog(true);
    setAssetId(assetId);
  }, []);

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <Web3Container>
      <div className="h-full relative grid grid-rows-[1fr,min-content]">
        <div>
          <AccountManager
            partyId={pubKey}
            onClickAsset={onClickAsset}
            onClickWithdraw={onClickWithdraw}
            onClickDeposit={onClickDeposit}
          />
        </div>
        <div className="flex justify-end p-2 px-[11px]">
          <Button
            size="sm"
            onClick={() => {
              setAssetId(undefined);
              setDepositDialog(true);
            }}
          >
            {t('Deposit')}
          </Button>
        </div>
      </div>
      <WithdrawalDialogs
        assetId={assetId}
        withdrawDialog={withdrawDialog}
        setWithdrawDialog={setWithdrawDialog}
      />
      <DepositDialog
        assetId={assetId}
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
      />
    </Web3Container>
  );
};
