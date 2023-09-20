import { t } from '@vegaprotocol/i18n';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { WithdrawFormContainer } from './withdraw-form-container';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useWithdrawalDialog } from './withdrawal-dialog';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';

export const CreateWithdrawalDialog = () => {
  const { assetId, isOpen, open, close } = useWithdrawalDialog();
  const { pubKey } = useVegaWallet();
  const createTransaction = useVegaTransactionStore((state) => state.create);
  const connectWalletDialogIsOpen = useWeb3ConnectStore(
    (state) => state.isOpen
  );
  return (
    <Dialog
      id="create-withdrawal-dialog"
      title={t('Withdraw')}
      open={isOpen && !connectWalletDialogIsOpen}
      onChange={(isOpen) => (isOpen ? open() : close())}
      size="small"
    >
      <WithdrawFormContainer
        assetId={assetId}
        partyId={pubKey ? pubKey : undefined}
        submit={({ amount, asset, receiverAddress }) => {
          createTransaction({
            withdrawSubmission: {
              amount,
              asset,
              ext: {
                erc20: {
                  receiverAddress,
                },
              },
            },
          });
          close();
        }}
      />
    </Dialog>
  );
};
