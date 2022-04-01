import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useEffect, useRef, useState } from 'react';
import {
  isEthereumError,
  TxState,
} from '../../../hooks/use-ethereum-transaction';
import { ConfirmRow, TxRow, VegaRow } from './dialog-rows';
import { DialogWrapper } from './dialog-wrapper';

interface TransactionDialogProps<TEvent> {
  name: string;
  status: TxState;
  error: Error | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string | null;
  confirmationEvent?: TEvent | null;
}

export function TransactionDialog<TEvent>({
  name,
  status,
  error,
  confirmations,
  requiredConfirmations,
  txHash,
  confirmationEvent,
}: TransactionDialogProps<TEvent>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  const getDialogIntent = () => {
    if (status === TxState.Requested) {
      return Intent.Prompt;
    }

    if (status === TxState.Error) {
      return Intent.Danger;
    }

    if (confirmationEvent !== undefined) {
      if (confirmationEvent !== null) {
        return Intent.Success;
      }
    } else if (status === TxState.Complete) {
      return Intent.Success;
    }

    return Intent.Progress;
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
        {confirmationEvent !== undefined && (
          <VegaRow status={status} confirmed={Boolean(confirmationEvent)} />
        )}
      </>
    );
  };

  const renderIcon = () => {
    if (status === TxState.Error) {
      return <Icon name="warning-sign" size={20} />;
    }

    if (status === TxState.Requested) {
      return <Icon name="hand-up" size={20} />;
    }

    if (confirmationEvent !== undefined) {
      if (confirmationEvent !== null) {
        return <Icon name="tick" />;
      }
    } else if (status === TxState.Complete) {
      return <Icon name="tick" />;
    }

    return <Loader />;
  };

  const renderTitle = () => {
    if (status === TxState.Requested) {
      return t('Confirm transaction');
    }

    if (status === TxState.Error) {
      return t(`${name} failed`);
    }

    if (confirmationEvent !== undefined) {
      if (confirmationEvent !== null) {
        return t(`${name} complete`);
      }
    } else if (status === TxState.Complete) {
      return t(`${name} complete`);
    }

    return t(`${name} pending`);
  };

  return (
    <Dialog
      open={dialogOpen}
      onChange={(isOpen) => {
        setDialogOpen(isOpen);
        dialogDismissed.current = true;
      }}
      intent={getDialogIntent()}
    >
      <DialogWrapper title={renderTitle()} icon={renderIcon()}>
        {renderStatus()}
      </DialogWrapper>
    </Dialog>
  );
}
