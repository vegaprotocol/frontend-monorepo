import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { useConnectors } from '../lib/vega-connectors';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { RiskMessage } from '../components/welcome-dialog';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  // const connectors = useConnectors();
  return (
    <>
      {/* <VegaConnectDialog */}
      {/*   connectors={connectors} */}
      {/*   riskMessage={<RiskMessage />} */}
      {/* /> */}
      {/* <ViewAsDialog connector={connectors.view} /> */}
      <AssetDetailsDialog
        assetId={id}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      {/* <WelcomeDialog /> */}
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
    </>
  );
};

export default DialogsContainer;
