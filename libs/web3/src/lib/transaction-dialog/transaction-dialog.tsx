import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { isEthereumError } from '../ethereum-error';
import type { EthTxState, TxError } from '../use-ethereum-transaction';
import { EthTxStatus } from '../use-ethereum-transaction';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';

export interface TransactionDialogProps {
  name: string;
  onChange: (isOpen: boolean) => void;
  transaction: EthTxState;
  // Undefined means this dialog isn't expecting an additional event for a complete state, a boolean
  // value means it is but hasn't been received yet
  requiredConfirmations?: number;
}

export const TransactionDialog = ({
  onChange,
  name,
  transaction,
  requiredConfirmations = 1,
}: TransactionDialogProps) => {
  const { status, error, confirmations, txHash } = transaction;
  const { intent, title, icon } = getWrapperProps(name, status);
  return (
    <Dialog
      open={transaction.dialogOpen}
      onChange={onChange}
      intent={intent}
      title={title}
      icon={icon}
    >
      <TransactionContent
        status={status}
        error={error}
        txHash={txHash}
        confirmations={confirmations}
        requiredConfirmations={requiredConfirmations}
      />
    </Dialog>
  );
};

export const TransactionContent = ({
  status,
  error,
  txHash,
  confirmations,
  requiredConfirmations = 1,
}: {
  status: EthTxStatus;
  error: TxError | null;
  txHash: string | null;
  confirmations: number;
  requiredConfirmations?: number;
}) => {
  if (status === EthTxStatus.Error) {
    const classNames = 'break-all text-black dark:text-white';
    if (isEthereumError(error)) {
      return (
        <p className={classNames}>
          {t('Error')}: {error.reason}
        </p>
      );
    }

    if (error instanceof Error) {
      return (
        <p className={classNames}>
          {t('Error')}: {error.message}
        </p>
      );
    }

    return (
      <p className={classNames}>
        {t('Error')}: {t('Unknown error')}
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
      <ConfirmationEventRow status={status} />
    </>
  );
};

export const getWrapperProps = (name: string, status: EthTxStatus) => {
  const propsMap = {
    [EthTxStatus.Default]: {
      title: '',
      icon: null,
      intent: undefined,
    },
    [EthTxStatus.Error]: {
      title: t(`${name} failed`),
      icon: <Icon name="warning-sign" />,
      intent: Intent.Danger,
    },
    [EthTxStatus.Requested]: {
      title: t('Confirm transaction'),
      icon: <Icon name="hand-up" />,
      intent: Intent.Warning,
    },
    [EthTxStatus.Pending]: {
      title: t(`${name} pending`),
      icon: <Loader size="small" />,
      intent: Intent.None,
    },
    [EthTxStatus.Complete]: {
      title: t(`${name} pending`),
      icon: <Loader size="small" />,
      intent: Intent.None,
    },
    [EthTxStatus.Confirmed]: {
      title: t(`${name} complete`),
      icon: <Icon name="tick" />,
      intent: Intent.Success,
    },
  };

  return propsMap[status];
};
