import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import {
  useVegaTransactionStore,
  VegaConnectDialog,
  VegaTransactionDialog,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import { Connectors } from '../lib/vega-connectors';
import { RiskNoticeDialog } from '../components/risk-notice-dialog';
import { CreateWithdrawalDialog } from '@vegaprotocol/withdraws';
import { DepositDialog } from '@vegaprotocol/deposits';
import {
  EthereumTransactionDialog,
  EthTxStatus,
  useEthTransactionStore,
  Web3ConnectUncontrolledDialog,
} from '@vegaprotocol/web3';
import { WelcomeNoticeDialog } from '../components/welcome-notice';
import compact from 'lodash/compact';
import { t } from '@vegaprotocol/react-helpers';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const vegaTransactions = useVegaTransactionStore((state) =>
    state.transactions.filter(
      (transaction) =>
        transaction?.dialogOpen &&
        transaction?.status === VegaTxStatus.Requested
    )
  );
  const ethTransactions = useEthTransactionStore((state) =>
    state.transactions.filter(
      (transaction) =>
        transaction?.dialogOpen && transaction?.status === EthTxStatus.Requested
    )
  );

  const vegaTransactionDialogs = compact(vegaTransactions).map((tx) => (
    <VegaTransactionDialog
      key={tx.id}
      isOpen={tx.dialogOpen}
      transaction={tx}
    />
  ));
  const ethTransactionDialogs = compact(ethTransactions).map((tx) => (
    <EthereumTransactionDialog
      key={tx.id}
      transaction={tx}
      title={t('Confirm transaction')}
    />
  ));

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
      <CreateWithdrawalDialog />
      <WelcomeNoticeDialog />
      {/* {vegaTransactionDialogs}
      {ethTransactionDialogs} */}
    </>
  );
};

export default DialogsContainer;
