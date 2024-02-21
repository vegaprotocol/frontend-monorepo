import { Dialog } from '@vegaprotocol/ui-toolkit';
import { type Status, type ConnectorType } from '@vegaprotocol/wallet';
import {
  ConnectionOptions,
  ConnectionStatus,
  useConnect,
  useDialogStore,
  useWallet,
} from '@vegaprotocol/wallet-react';
import {
  useOnboardingStore,
  type RiskStatus,
} from '../welcome-dialog/use-get-onboarding-step';
import { RiskAck } from '../risk-ack';
import { Networks, useEnvironment } from '@vegaprotocol/environment';

const DIALOG_CLOSE_DELAY = 1000;

export const VegaWalletConnectDialog = () => {
  const { connect } = useConnect();
  const open = useDialogStore((store) => store.isOpen);
  const setDialog = useDialogStore((store) => store.set);
  const risk = useOnboardingStore((store) => store.risk);

  const status = useWallet((store) => store.status);

  const onConnect = async (id: ConnectorType) => {
    const res = await connect(id);
    if (res.status === 'connected') {
      setTimeout(() => setDialog(false), DIALOG_CLOSE_DELAY);
    }
  };

  return (
    <Dialog open={open} size="small" onChange={setDialog}>
      <Content risk={risk} status={status} onConnect={onConnect} />
    </Dialog>
  );
};

const Content = ({
  risk,
  status,
  onConnect,
}: {
  risk: RiskStatus;
  status: Status;
  onConnect: (id: ConnectorType) => void;
}) => {
  const { VEGA_ENV } = useEnvironment();
  const setDialog = useDialogStore((store) => store.set);
  const acceptRisk = useOnboardingStore((store) => store.acceptRisk);
  const rejectRisk = useOnboardingStore((store) => store.rejectRisk);

  if (VEGA_ENV === Networks.MAINNET && risk !== 'accepted') {
    return (
      <RiskAck
        onAccept={() => {
          acceptRisk();
        }}
        onReject={() => {
          rejectRisk();
          setDialog(false);
        }}
      />
    );
  }

  if (status === 'disconnected') {
    return <ConnectionOptions onConnect={onConnect} />;
  }

  return <ConnectionStatus status={status} />;
};
