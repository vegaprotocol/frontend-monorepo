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
import { useChainId } from '@vegaprotocol/wallet-react';
import { BrowserWallerDialog } from '../components/browser-wallet-dialog';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const { chainId } = useChainId();

  return (
    <>
      <VegaWalletConnectDialog />
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
        vegaChain={chainId}
      />
      <WelcomeDialog />
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
      <ProfileDialog />
      <BrowserWallerDialog />
    </>
  );
};

export default DialogsContainer;
