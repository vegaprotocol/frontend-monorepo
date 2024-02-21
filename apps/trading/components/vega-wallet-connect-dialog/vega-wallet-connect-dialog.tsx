import { Dialog } from '@vegaprotocol/ui-toolkit';
import { type ConnectorType } from '@vegaprotocol/wallet';
import {
  ConnectionOptions,
  ConnectionStatus,
  useConnect,
  useDialogStore,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { useOnboardingStore } from '../welcome-dialog/use-get-onboarding-step';
import { RiskAck } from '../risk-ack';
import { useT } from '../../lib/use-t';

const DIALOG_CLOSE_DELAY = 1000;

export const VegaWalletConnectDialog = () => {
  const t = useT();
  const open = useDialogStore((store) => store.isOpen);
  const setDialog = useDialogStore((store) => store.set);
  const risk = useOnboardingStore((store) => store.risk);

  const { connect } = useConnect();
  const status = useWallet((store) => store.status);

  const onConnect = async (id: ConnectorType) => {
    const res = await connect(id);
    if (res.status === 'connected') {
      setTimeout(() => setDialog(false), DIALOG_CLOSE_DELAY);
    }
  };

  let content = null;
  let title = null;

  if (risk !== 'accepted') {
    title = t('Understand the risk');
    content = <RiskAck />;
  } else if (status === 'disconnected') {
    content = <ConnectionOptions onConnect={onConnect} />;
  } else {
    content = <ConnectionStatus status={status} />;
  }

  return (
    <Dialog open={open} size="small" onChange={setDialog} title={title}>
      {content}
    </Dialog>
  );
};
