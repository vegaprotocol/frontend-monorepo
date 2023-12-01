import { Button, Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { isEthereumError } from '../ethereum-error';
import type { EthTxState, TxError } from '../use-ethereum-transaction';
import { EthTxStatus } from '../use-ethereum-transaction';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';
import { useT } from '../use-t';

export interface EthereumTransactionDialogProps {
  title: string;
  transaction: EthTxState;
  onChange?: (isOpen: boolean) => void;
  // Undefined means this dialog isn't expecting an additional event for a complete state, a boolean
  // value means it is but hasn't been received yet
  requiredConfirmations?: number;
}

export const EthereumTransactionDialog = ({
  title,
  transaction,
  onChange,
  requiredConfirmations = 1,
}: EthereumTransactionDialogProps) => {
  const t = useT();
  const { status, error, confirmations, txHash } = transaction;
  return (
    <Dialog
      open={transaction.dialogOpen}
      onChange={onChange}
      size="small"
      {...getWrapperProps(title, status, t)}
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

export const getTransactionContent = ({
  title,
  transaction,
  requiredConfirmations,
  reset,
  t,
}: {
  title: string;
  transaction: EthTxState;
  requiredConfirmations?: number;
  reset: () => void;
  t: ReturnType<typeof useT>;
}) => {
  const { status, error, confirmations, txHash } = transaction;
  const content = ({ returnLabel }: { returnLabel?: string }) => (
    <>
      {status !== EthTxStatus.Default && (
        <TransactionContent
          status={status}
          error={error}
          txHash={txHash}
          confirmations={confirmations}
          requiredConfirmations={requiredConfirmations}
        />
      )}
      {(status === EthTxStatus.Confirmed || status === EthTxStatus.Error) && (
        <Button
          size="sm"
          className="mt-2"
          data-testid={returnLabel}
          onClick={reset}
        >
          {returnLabel ? returnLabel : t('Return')}
        </Button>
      )}
    </>
  );
  return {
    ...getWrapperProps(title, status, t),
    status,
    Content: content,
  };
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
  const t = useT();
  if (status === EthTxStatus.Error) {
    let errorMessage = '';

    if (isEthereumError(error)) {
      errorMessage = error.reason;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <p className="break-all">
        {t('Error: {{errorMessage}}', {
          errorMessage,
        })}
      </p>
    );
  }

  return (
    <div className="text-sm">
      <ConfirmRow status={status} />
      <TxRow
        status={status}
        txHash={txHash}
        confirmations={confirmations}
        requiredConfirmations={requiredConfirmations}
        highlightComplete={false}
      />
      <ConfirmationEventRow status={status} />
    </div>
  );
};

type WrapperProps = { title: string; icon?: JSX.Element; intent?: Intent };
export const getWrapperProps = (
  title: string,
  status: EthTxStatus,
  t: ReturnType<typeof useT>
): WrapperProps => {
  const propsMap = {
    [EthTxStatus.Default]: {
      title: '',
      icon: undefined,
      intent: undefined,
    },
    [EthTxStatus.Error]: {
      title: t(`{{title}} failed`, { title }),
      icon: <Icon name="warning-sign" />,
      intent: Intent.Danger,
    },
    [EthTxStatus.Requested]: {
      title: t('Confirm transaction', { title }),
      icon: <Icon name="hand-up" />,
      intent: Intent.Warning,
    },
    [EthTxStatus.Pending]: {
      title: t(`{{title}} pending`, { title }),
      icon: (
        <span className="mt-1">
          <Loader size="small" />
        </span>
      ),
      intent: Intent.None,
    },
    [EthTxStatus.Complete]: {
      title: t(`{{title}} pending`, { title }),
      icon: <Loader size="small" />,
      intent: Intent.None,
    },
    [EthTxStatus.Confirmed]: {
      title: t(`{{title}} complete`, { title }),
      icon: <Icon name="tick" />,
      intent: Intent.Success,
    },
  };

  return propsMap[status];
};
