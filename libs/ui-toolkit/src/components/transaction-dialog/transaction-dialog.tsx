import { useEffect, useRef, useState } from 'react';
import {
  t,
  TxState,
  isExpectedEthereumError,
} from '@vegaprotocol/react-helpers';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';
import { DialogWrapper } from './dialog-wrapper';
import { Loader } from '../loader';
import { Intent } from '../../utils/intent';
import { Dialog } from '../dialog';
import { Icon } from '../icon';

export interface TransactionDialogProps {
  name: string;
  status: TxState;
  error: Error | null;
  confirmations: number;
  txHash: string | null;
  requiredConfirmations?: number;
  // Undefined means this dialog isn't expecting an additional event for a complete state, a boolean
  // value means it is but hasn't been received yet
  confirmed?: boolean;
}

export const TransactionDialog = ({
  name,
  status,
  error,
  confirmations,
  txHash,
  requiredConfirmations = 1,
  confirmed,
}: TransactionDialogProps) => {
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
        {confirmed !== undefined && (
          <ConfirmationEventRow status={status} confirmed={confirmed} />
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

    if (confirmed !== undefined) {
      if (confirmed === true) {
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
    if (status === TxState.Error && isExpectedEthereumError(error)) {
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
};
