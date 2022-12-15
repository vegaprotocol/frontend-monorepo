import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { VegaConnectDialog } from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { CreateWithdrawalDialog } from '@vegaprotocol/withdraws';
import { DepositDialog } from '@vegaprotocol/deposits';
import { Web3ConnectUncontrolledDialog } from '@vegaprotocol/web3';
import { WelcomeDialog } from '../components/welcome-dialog';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();

  return (
    <>
      <VegaConnectDialog connectors={Connectors} />
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      <WelcomeDialog />
      <DepositDialog />
      <Web3ConnectUncontrolledDialog />
      <CreateWithdrawalDialog />
    </>
  );
};

export default DialogsContainer;
