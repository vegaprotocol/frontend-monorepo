import { useState } from 'react';
import { Button, Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { WithdrawalDialogs } from '@vegaprotocol/withdraws';
import { Web3Container } from '@vegaprotocol/web3';
import { DepositContainer } from '@vegaprotocol/deposits';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountsTable } from '@vegaprotocol/accounts';

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
        <AssetAccountTable partyId={keypair.pub} />
        <div className="m-auto ml-4">
          <Button size="sm" onClick={() => setDepositDialog(true)}>
            {t('Deposit new asset')}
          </Button>
        </div>
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
  const { setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol } =
    useAssetDetailsDialogStore();
  return (
    <>
      <AccountsTable
        partyId={partyId}
        onClickAsset={(value) => {
          if (value) {
            setAssetDetailsDialogOpen(true);
            setAssetDetailsDialogSymbol(value);
          }
        }}
        onClickWithdraw={() => setWithdrawDialog(true)}
        onClickDeposit={() => setDepositDialog(true)}
      />
      <WithdrawalDialogs
        withdrawDialog={withdrawDialog}
        setWithdrawDialog={setWithdrawDialog}
      />
      <DepositDialog
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
