import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import {
  ConnectDialog,
  useVegaWalletDialogStore,
  useVegaWallet,
} from '@vegaprotocol/wallet';

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

  const { onConnect } = useVegaWallet();

  return (
    <>
      <ConnectDialog
        open={vegaWalletDialogOpen}
        onChange={updateVegaWalletDialog}
        onConnect={onConnect}
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
