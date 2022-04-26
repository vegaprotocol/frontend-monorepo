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
        <p className="break-all text-black dark:text-white">
          {error && error.message}
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
          highlightComplete={false}
        />
        {confirmed !== undefined && (
          <ConfirmationEventRow status={status} confirmed={confirmed} />
        )}
      </>
    );
  };

  const getWrapperProps = () => {
    const propsMap = {
      [TxState.Error]: {
        title: t(`${name} failed`),
        icon: <Icon name="warning-sign" size={20} />,
        intent: Intent.Danger,
      },
      [TxState.Requested]: {
        title: t('Confirm transaction'),
        icon: <Icon name="hand-up" size={20} />,
        intent: Intent.Prompt,
      },
      [TxState.Pending]: {
        title: t(`${name} pending`),
        icon: <Loader size="small" />,
        intent: Intent.Progress,
      },
      [TxState.Complete]: {
        title: t(`${name} complete`),
        icon: <Icon name="tick" />,
        intent: Intent.Success,
      },
    };

    // Dialog not showing
    if (status === TxState.Default) {
      return { intent: undefined, title: '', icon: null };
    }

    // Confirmation event bool is required so
    if (confirmed !== undefined) {
      // Vega has confirmed Tx
      if (confirmed === true) {
        return propsMap[TxState.Complete];
      }
      // Tx is complete but still awaiting for Vega to confirm
      else if (status === TxState.Complete) {
        return propsMap[TxState.Pending];
      }
    }

    return propsMap[status];
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
