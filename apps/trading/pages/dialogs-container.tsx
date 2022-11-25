import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { VegaConnectDialog } from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { RiskNoticeDialog } from '../components/risk-notice-dialog';
import { WithdrawalDialog } from '@vegaprotocol/withdraws';
import { DepositDialog } from '@vegaprotocol/deposits';
import { Web3Container } from '@vegaprotocol/web3';
import { Web3ConnectUncontrolledDialog } from '@vegaprotocol/web3';
import { WelcomeNoticeDialog } from '../components/welcome-notice';

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
      <RiskNoticeDialog />
      <DepositDialog />
      <Web3ConnectUncontrolledDialog />
      <Web3Container childrenOnly connectEagerly>
        <WithdrawalDialog />
      </Web3Container>
      <WelcomeNoticeDialog />
    </>
  );
};

export default DialogsContainer;
