import { useState } from 'react';
import { Button, Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import { DepositContainer } from '@vegaprotocol/deposits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountManager } from '@vegaprotocol/accounts';

export const AccountsContainer = () => {
  const { keypair } = useVegaWallet();
  const [depositDialog, setDepositDialog] = useState(false);

  if (!keypair) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <Web3Container>
      <div className="h-full">
        <header className="flex justify-between items-center p-4">
          <h1 className="text-lg text-black dark:text-white">
            {t('Collateral')}
          </h1>
          <Button
            size="sm"
            onClick={() => setDepositDialog(true)}
            data-testid="deposit-new-dialog-button"
          >
            {t('Deposit new asset')}
          </Button>
        </header>
        <AssetAccountTable partyId={keypair.pub} />
        <DepositDialog
          depositDialog={depositDialog}
          setDepositDialog={setDepositDialog}
        />
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

export interface DepositDialogProps {
  assetId?: string;
  depositDialog: boolean;
  setDepositDialog: (open: boolean) => void;
}

export const DepositDialog = ({
  assetId,
  depositDialog,
  setDepositDialog,
}: DepositDialogProps) => {
  return (
    <Dialog open={depositDialog} onChange={setDepositDialog}>
      <h1 className="text-2xl mb-4">{t('Deposit')}</h1>
      <DepositContainer assetId={assetId} />
    </Dialog>
  );
};
