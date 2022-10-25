import { t } from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useCompleteWithdraw } from './use-complete-withdraw';
import { useCreateWithdraw } from './use-create-withdraw';
import { WithdrawFormContainer } from './withdraw-form-container';
import { WithdrawalFeedback } from './withdrawal-feedback';

export const WithdrawalDialogs = ({
  withdrawDialog,
  setWithdrawDialog,
  assetId,
}: {
  withdrawDialog: boolean;
  setWithdrawDialog: (open: boolean) => void;
  assetId?: string;
}) => {
  const { pubKey } = useVegaWallet();
  const createWithdraw = useCreateWithdraw();
  const completeWithdraw = useCompleteWithdraw();
  return (
    <>
      <Dialog
        title={t('Withdraw')}
        open={withdrawDialog}
        onChange={(isOpen) => setWithdrawDialog(isOpen)}
        size="small"
      >
        <WithdrawFormContainer
          assetId={assetId}
          partyId={pubKey ? pubKey : undefined}
          submit={(args) => {
            setWithdrawDialog(false);
            createWithdraw.submit(args);
          }}
        />
      </Dialog>
      <createWithdraw.Dialog
        content={{
          Complete: (
            <WithdrawalFeedback
              withdrawal={createWithdraw.withdrawal}
              transaction={createWithdraw.transaction}
              availableTimestamp={createWithdraw.availableTimestamp}
              submitWithdraw={(id) => {
                createWithdraw.reset();
                completeWithdraw.submit(id);
              }}
            />
          ),
        }}
      />
      <completeWithdraw.Dialog />
    </>
  );
};
