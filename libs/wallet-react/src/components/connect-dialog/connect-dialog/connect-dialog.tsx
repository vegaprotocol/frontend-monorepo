import { type ReactNode } from 'react';

import { Dialog } from '@vegaprotocol/ui-toolkit';
import { type ConnectorType, type Status } from '@vegaprotocol/wallet';

import { useWallet } from '../../../hooks/use-wallet';
import { useConnect } from '../../../hooks/use-connect';
import { RiskAck } from '../../risk-ack';
import { ConnectionStatus } from '../connection-status';
import { ConnectionOptionsList } from '../connection-options';
import { useConfig } from '../../../hooks/use-config';

export const DIALOG_CLOSE_DELAY = 1000;

export const ConnectDialogWithRiskAck = ({
  open,
  riskAccepted = true,
  riskAckContent,
  onChange,
  onRiskAccepted,
  onRiskRejected,
}: {
  open: boolean;
  riskAccepted?: boolean;
  riskAckContent: ReactNode;
  onChange: (open: boolean) => void;
  onRiskAccepted: () => void;
  onRiskRejected: () => void;
}) => {
  const { connect } = useConnect();
  const state = useConfig();
  const status = useWallet((store) => store.status);
  const wrappedOnChange = (val: boolean) => {
    if (!val && status === 'importing') {
      state.store.setState({
        status: 'disconnected',
      });
    }
    onChange(val);
  };

  const onConnect = async (id: ConnectorType) => {
    const res = await connect(id);
    if (res.status === 'connected') {
      setTimeout(() => onChange(false), DIALOG_CLOSE_DELAY);
    }
  };

  return (
    <Dialog
      open={open}
      size="small"
      onChange={wrappedOnChange}
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      <Content
        riskAccepted={riskAccepted}
        riskAckContent={riskAckContent}
        status={status}
        onConnect={onConnect}
        acceptRisk={onRiskAccepted}
        rejectRisk={onRiskRejected}
      />
    </Dialog>
  );
};

const Content = ({
  riskAccepted,
  riskAckContent,
  status,
  onConnect,
  acceptRisk,
  rejectRisk,
}: {
  riskAccepted: boolean;
  riskAckContent: ReactNode;
  status: Status;
  onConnect: (id: ConnectorType) => void;
  acceptRisk: () => void;
  rejectRisk: () => void;
}) => {
  if (!riskAccepted) {
    return (
      <RiskAck onAccept={acceptRisk} onReject={rejectRisk}>
        {riskAckContent}
      </RiskAck>
    );
  }

  if (status === 'disconnected') {
    return <ConnectionOptionsList onConnect={onConnect} />;
  }

  return <ConnectionStatus status={status} />;
};

export const ConnectDialog = ({
  open,
  onChange,
}: {
  open: boolean;
  onChange: (open: boolean) => void;
}) => {
  const { connect } = useConnect();
  const status = useWallet((store) => store.status);
  const state = useConfig();

  const onConnect = async (id: ConnectorType) => {
    const res = await connect(id);
    if (res.status === 'connected') {
      setTimeout(() => onChange(false), DIALOG_CLOSE_DELAY);
    }
  };

  const wrappedOnChange = (val: boolean) => {
    if (!val && status === 'importing') {
      state.store.setState({
        status: 'disconnected',
      });
    }
    onChange(val);
  };

  return (
    <Dialog
      open={open}
      size="small"
      onChange={wrappedOnChange}
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
    >
      {status === 'disconnected' ? (
        <ConnectionOptionsList onConnect={onConnect} />
      ) : (
        <ConnectionStatus status={status} />
      )}
    </Dialog>
  );
};
