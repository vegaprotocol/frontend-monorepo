import { useEffect, useRef, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { isExpectedEthereumError } from '../ethereum-error';
import { EthTxStatus } from '../use-ethereum-transaction';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';
import { DialogWrapper } from './dialog-wrapper';

export interface TransactionDialogProps {
  name: string;
  etherscanUrl: string;
  status: EthTxStatus;
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
  etherscanUrl,
}: TransactionDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  const renderContent = () => {
    if (status === EthTxStatus.Error) {
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
          etherscanUrl={etherscanUrl}
        />
        {confirmed !== undefined && (
          <ConfirmationEventRow status={status} confirmed={confirmed} />
        )}
      </>
    );
  };

  const getWrapperProps = () => {
    const propsMap = {
      [EthTxStatus.Error]: {
        title: t(`${name} failed`),
        icon: <Icon name="warning-sign" size={20} />,
        intent: Intent.Danger,
      },
      [EthTxStatus.Requested]: {
        title: t('Confirm transaction'),
        icon: <Icon name="hand-up" size={20} />,
        intent: Intent.Prompt,
      },
      [EthTxStatus.Pending]: {
        title: t(`${name} pending`),
        icon: <Loader size="small" />,
        intent: Intent.Progress,
      },
      [EthTxStatus.Complete]: {
        title: t(`${name} complete`),
        icon: <Icon name="tick" />,
        intent: Intent.Success,
      },
    };

    // Dialog not showing
    if (status === EthTxStatus.Default) {
      return { intent: undefined, title: '', icon: null };
    }

    // Confirmation event bool is required so
    if (confirmed !== undefined) {
      // Vega has confirmed Tx
      if (confirmed === true) {
        return propsMap[EthTxStatus.Complete];
      }
      // Tx is complete but still awaiting for Vega to confirm
      else if (status === EthTxStatus.Complete) {
        return propsMap[EthTxStatus.Pending];
      }
    }

    return propsMap[status];
  };

  useEffect(() => {
    // Close dialog if error is due to user rejecting the tx
    if (status === EthTxStatus.Error && isExpectedEthereumError(error)) {
      setDialogOpen(false);
      return;
    }

    if (status !== EthTxStatus.Default && !dialogDismissed.current) {
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
