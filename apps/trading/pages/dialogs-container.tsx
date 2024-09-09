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
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { BrowserWallet } from '../components/browser-wallet';

const BrowserWallerDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(true);

  return (
    <Dialog
      open={dialogOpen}
      onChange={(open) => {
        setDialogOpen(open);
      }}
    >
      <div className="h-full" style={{ minHeight: 600, height: 600 }}>
        <BrowserWallet />
      </div>
    </Dialog>
  );
};

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
