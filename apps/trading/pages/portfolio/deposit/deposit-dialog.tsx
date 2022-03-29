import { DepositEvent_busEvents_event_Deposit } from '@vegaprotocol/graphql';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect, useRef, useState } from 'react';
import {
  TxState,
  TxError,
  isEthereumError,
} from '../../../hooks/use-ethereum-transaction';
import { ConfirmRow, TxRow, VegaRow } from './dialog-rows';

interface DepositDialogProps {
  status: TxState;
  error: TxError | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string | null;
  finalizedDeposit: DepositEvent_busEvents_event_Deposit | null;
}

export const DepositDialog = ({
  status,
  error,
  confirmations,
  requiredConfirmations,
  txHash,
  finalizedDeposit,
}: DepositDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  useEffect(() => {
    // Close dialog if error is due to user rejecting the tx
    if (
      status === TxState.Error &&
      isEthereumError(error) &&
      error.code === 4001
    ) {
      setDialogOpen(false);
      return;
    }

    if (status !== TxState.Default && !dialogDismissed.current) {
      setDialogOpen(true);
      return;
    }
  }, [status, error]);

  const getDialogIntent = () => {
    if (status === TxState.Requested) {
      return Intent.Prompt;
    }
    if (status === TxState.Error) {
      return Intent.Danger;
    }
    if (!finalizedDeposit) {
      return Intent.Progress;
    }
    if (finalizedDeposit) {
      return Intent.Success;
    }
  };

  const renderStatus = () => {
    if (status === TxState.Error) {
      return (
        <p className="text-black dark:text-white">{error && error.message}</p>
      );
    }

    return (
      <>
        <ConfirmRow status={status} />
        <TxRow
          status={status}
          txHash={txHash}
          confirmations={confirmations}
          requiredConfirmations={requiredConfirmations}
          highlightComplete={false}
        />
        <VegaRow status={status} finalizedDeposit={finalizedDeposit} />
      </>
    );
  };

  const renderTitle = () => {
    if (status === TxState.Error) {
      return 'Deposit failed';
    }

    if (finalizedDeposit) {
      return 'Deposit complete';
    }

    return 'Deposit pending';
  };

  return (
    <Dialog
      title={renderTitle()}
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={getDialogIntent()}
    >
      <div className="text-ui text-black-40 dark:text-white-40">
        {renderStatus()}
      </div>
    </Dialog>
  );
};
