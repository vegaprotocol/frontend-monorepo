import { useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountManager } from '@vegaprotocol/accounts';
import { DepositDialog } from './deposits-container';

export const AccountsContainer = () => {
  const { pubKey } = useVegaWallet();
  const [depositDialog, setDepositDialog] = useState(false);

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
        <AssetAccountTable partyId={pubKey} />
        <DepositDialog
          depositDialog={depositDialog}
          setDepositDialog={setDepositDialog}
        />
        <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
          <Button size="sm" variant="secondary" onClick={() => setDepositDialog(true)}>
            Deposit
          </Button>
        </div>
      </div>
    </Web3Container>
  );
};

export const AssetAccountTable = ({ partyId }: { partyId: string }) => {
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  const [assetId, setAssetId] = useState<string>();
  return (
    <>
      <AccountManager
        partyId={partyId}
        onClickAsset={(value) => {
          value && openAssetDetailsDialog(value);
        }}
        onClickWithdraw={(assetId) => {
          setWithdrawDialog(true);
          setAssetId(assetId);
        }}
        onClickDeposit={(assetId) => {
          setDepositDialog(true);
          setAssetId(assetId);
        }}
      />
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
    </>
  );
};
