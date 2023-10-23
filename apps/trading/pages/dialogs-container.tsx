import { VegaConnectDialog, ViewAsDialog } from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import {
  Web3ConnectUncontrolledDialog,
  WithdrawalApprovalDialogContainer,
} from '@vegaprotocol/web3';
import { WelcomeDialog } from '../components/welcome-dialog';
import { RiskMessage } from '../components/welcome-dialog';
import { LocalAssetDetailsDialog as AssetDetailsDialog } from '../components/asset-details-dialog';

const DialogsContainer = () => {
  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
        riskMessage={<RiskMessage />}
      />
      <ViewAsDialog connector={Connectors.view} />
      <AssetDetailsDialog />
      <WelcomeDialog />
      <Web3ConnectUncontrolledDialog />
      <WithdrawalApprovalDialogContainer />
    </>
  );
};

export default DialogsContainer;
