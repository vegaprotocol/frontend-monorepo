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
import { TransferDialog } from '@vegaprotocol/accounts';
import { useGlobalStore } from '../stores';
import { useCallback } from 'react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../components/constants';

const DialogsContainer = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const [riskAccepted] = useLocalStorage(constants.RISK_ACCEPTED_KEY);
  const update = useGlobalStore((store) => store.update);
  const openRiskDialog = useCallback(() => {
    if (riskAccepted !== 'true') {
      update({ shouldDisplayMainnetRiskDialog: true });
    }
  }, [update, riskAccepted]);
  return (
    <>
      <VegaConnectDialog
        connectors={Connectors}
        onChangeOpen={openRiskDialog}
      />
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
      <TransferDialog />
    </>
  );
};

export default DialogsContainer;
