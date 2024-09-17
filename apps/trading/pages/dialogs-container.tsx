import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { VegaWalletConnectDialog } from '../components/vega-wallet-connect-dialog';
import { ProfileDialog } from '../components/profile-dialog';
import { useChainId } from '@vegaprotocol/wallet-react';
import { BrowserWalletDialog } from '../components/browser-wallet-dialog';
import { ShareDialog } from '../components/share-dialog/share-dialog';

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
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
      <ProfileDialog />
      <BrowserWalletDialog />
      <ShareDialog />
    </>
  );
};

export default DialogsContainer;
