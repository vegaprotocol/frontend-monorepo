import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useEffect, useRef, useState } from 'react';
import {
  isEthereumError,
  TxState,
} from '../../../hooks/use-ethereum-transaction';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';
import { DialogWrapper } from './dialog-wrapper';

export interface TransactionDialogProps<TEvent = undefined> {
  name: string;
  status: TxState;
  error: Error | null;
  confirmations: number;
  txHash: string | null;
  requiredConfirmations?: number;
  // Undefined means this dialog isn't expecting an additional event for a complete state, null means
  // it is but hasn't been received yet
  confirmationEvent?: TEvent | null;
}

export function TransactionDialog<TEvent = undefined>({
  name,
  status,
  error,
  confirmations,
  txHash,
  requiredConfirmations = 1,
  confirmationEvent,
}: TransactionDialogProps<TEvent>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  const renderContent = () => {
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
        {confirmationEvent !== undefined && (
          <ConfirmationEventRow
            status={status}
            confirmed={Boolean(confirmationEvent)}
          />
        )}
      </>
    );
  };

  const getWrapperProps = () => {
    let title = t(`${name} pending`);
    let icon = <Loader />;
    let intent = Intent.Progress;

    if (status === TxState.Error) {
      title = t(`${name} failed`);
      icon = <Icon name="warning-sign" size={20} />;
      intent = Intent.Danger;
    }

    if (status === TxState.Requested) {
      title = t('Confirm transaction');
      icon = <Icon name="hand-up" size={20} />;
      intent = Intent.Prompt;
    }

    if (confirmationEvent !== undefined) {
      if (confirmationEvent !== null) {
        title = t(`${name} complete`);
        icon = <Icon name="tick" />;
        intent = Intent.Success;
      }
    } else if (status === TxState.Complete) {
      title = t(`${name} complete`);
      icon = <Icon name="tick" />;
      intent = Intent.Success;
    }

    return {
      title,
      icon,
      intent,
    };
  };

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

  const { intent, ...wrapperProps } = getWrapperProps();

  return (
    <Dialog
      open={dialogOpen}
      onChange={(isOpen) => {
        setDialogOpen(isOpen);
        dialogDismissed.current = true;
      }}
      intent={intent}
    >
      <DialogWrapper {...wrapperProps}>{renderContent()}</DialogWrapper>
    </Dialog>
  );
}
