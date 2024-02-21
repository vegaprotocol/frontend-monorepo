import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { ConnectDialog, useDialogStore } from '@vegaprotocol/wallet-react';
import { WelcomeDialog } from '../components/welcome-dialog';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const vegaWalletDialogOpen = useDialogStore((store) => store.isOpen);
  const updateVegaWalletDialog = useDialogStore((store) => store.set);

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
      <WelcomeDialog />
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
    </>
  );
};

export default DialogsContainer;
