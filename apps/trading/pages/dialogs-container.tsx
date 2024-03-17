import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { WelcomeDialog } from '../components/welcome-dialog';
import { VegaWalletConnectDialog } from '../components/vega-wallet-connect-dialog';
import { ProfileDialog } from '../components/profile-dialog';
import { connectors } from '../lib/web3-connectors';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();

  return (
    <>
      <VegaWalletConnectDialog />
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      <WelcomeDialog />
      <Web3ConnectUncontrolledDialog connectors={connectors} />
      <WithdrawalApprovalDialogContainer />
      <ProfileDialog />
    </>
  );
};

export default DialogsContainer;
