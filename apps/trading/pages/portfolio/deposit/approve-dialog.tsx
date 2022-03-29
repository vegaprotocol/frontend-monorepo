import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect, useRef, useState } from 'react';
import { TxState } from '../../../hooks/use-ethereum-transaction';
import { ConfirmRow, TxRow } from './dialog-rows';

interface ApproveDialogProps {
  status: TxState;
  error: Error | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string | null;
}

export const ApproveDialog = ({
  status,
  error,
  confirmations,
  requiredConfirmations,
  txHash,
}: ApproveDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  const getDialogIntent = () => {
    if (status === TxState.Requested) {
      return Intent.Prompt;
    }
    if (status === TxState.Pending) {
      return Intent.Progress;
    }
    if (status === TxState.Error) {
      return Intent.Danger;
    }
    if (status === TxState.Complete) {
      return Intent.Success;
    }
  };

  useEffect(() => {
    if (status !== TxState.Default && !dialogDismissed.current) {
      setDialogOpen(true);
    }
  }, [status]);

  const renderStatus = () => {
    if (status === TxState.Error) {
      return (
        <p className="text-black dark:text-white">
          Something went wrong: {error && error.message}
        </p>
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
        />
      </>
    );
  };

  return (
    <Dialog
      title={
        status === TxState.Complete ? 'Approval complete' : 'Approval pending'
      }
      open={dialogOpen}
      onChange={(isOpen) => {
        setDialogOpen(isOpen);
        dialogDismissed.current = true;
      }}
      intent={getDialogIntent()}
    >
      <div className="text-ui text-black-40 dark:text-white-40">
        {renderStatus()}
      </div>
    </Dialog>
  );
};
