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

const DialogsContainer = () => {
  const { isOpen, symbol, trigger, setOpen } = useAssetDetailsDialogStore();
  return (
    <>
      <VegaConnectDialog connectors={Connectors} />
      <AssetDetailsDialog
        assetSymbol={symbol}
        trigger={trigger || null}
        open={isOpen}
        onChange={setOpen}
      />
      <RiskNoticeDialog />
      <Web3Container childrenOnly={true}>
        <WithdrawalDialog />
      </Web3Container>
      <DepositDialog />
    </>
  );
};

export default DialogsContainer;
