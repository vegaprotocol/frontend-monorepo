import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { isEthereumError } from '../ethereum-error';
import type { EthTxState } from '../use-ethereum-transaction';
import { EthTxStatus } from '../use-ethereum-transaction';
import { ConfirmRow, TxRow, ConfirmationEventRow } from './dialog-rows';
import { DialogWrapper } from './dialog-wrapper';

export interface TransactionDialogProps {
  name: string;
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  transaction: EthTxState;
  // Undefined means this dialog isn't expecting an additional event for a complete state, a boolean
  // value means it is but hasn't been received yet
  requiredConfirmations?: number;
  confirmed?: boolean;
}

export const TransactionDialog = ({
  isOpen,
  onChange,
  name,
  transaction,
  requiredConfirmations = 1,
}: TransactionDialogProps) => {
  const { status, error, confirmations, txHash } = transaction;

  const renderContent = () => {
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

  const getWrapperProps = () => {
    const propsMap = {
      [EthTxStatus.Default]: {
        title: '',
        icon: null,
        intent: undefined,
      },
      [EthTxStatus.Error]: {
        title: t(`${name} failed`),
        icon: <Icon name="warning-sign" size={20} />,
        intent: Intent.Danger,
      },
      [EthTxStatus.Requested]: {
        title: t('Confirm transaction'),
        icon: <Icon name="hand-up" size={20} />,
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

  const { intent, ...wrapperProps } = getWrapperProps();

  return (
    <Dialog open={isOpen} onChange={onChange} intent={intent}>
      <DialogWrapper {...wrapperProps}>{renderContent()}</DialogWrapper>
    </Dialog>
  );
};
