import { create } from 'zustand';
import { t } from '@vegaprotocol/utils';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useCompleteWithdraw } from './use-complete-withdraw';
import { useCreateWithdraw } from './use-create-withdraw';
import { WithdrawFormContainer } from './withdraw-form-container';
import { WithdrawalFeedback } from './withdrawal-feedback';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
interface State {
  isOpen: boolean;
  assetId?: string;
}

interface Actions {
  open: (assetId?: string) => void;
  close: () => void;
}

export const useWithdrawalDialog = create<State & Actions>((set) => ({
  isOpen: false,
  assetId: undefined,
  open: (assetId) => set(() => ({ assetId, isOpen: true })),
  close: () => set(() => ({ assetId: undefined, isOpen: false })),
}));

export const WithdrawalDialog = () => {
  const { assetId, isOpen, open, close } = useWithdrawalDialog();
  const { pubKey } = useVegaWallet();
  const createWithdraw = useCreateWithdraw();
  const completeWithdraw = useCompleteWithdraw();
  const connectWalletDialogIsOpen = useWeb3ConnectStore(
    (state) => state.isOpen
  );
  return (
    <>
      <Dialog
        title={t('Withdraw')}
        open={isOpen && !connectWalletDialogIsOpen}
        onChange={(isOpen) => (isOpen ? open() : close())}
        size="small"
      >
        <WithdrawFormContainer
          assetId={assetId}
          partyId={pubKey ? pubKey : undefined}
          submit={(args) => {
            close();
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
