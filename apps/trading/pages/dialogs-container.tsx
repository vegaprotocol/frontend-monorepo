import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { ConnectDialog, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const vegaWalletDialogOpen = useVegaWalletDialogStore(
    (store) => store.vegaWalletDialogOpen
  );
  const updateVegaWalletDialog = useVegaWalletDialogStore(
    (store) => (open: boolean) => {
      store.updateVegaWalletDialog(open);
    }
  );

  return (
    <>
      <ConnectDialog
        open={vegaWalletDialogOpen}
        onChange={updateVegaWalletDialog}
      />
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
    </>
  );
};

export default DialogsContainer;
