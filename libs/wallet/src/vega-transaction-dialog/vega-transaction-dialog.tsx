import get from 'lodash/get';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';

export interface VegaTransactionDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  transaction: VegaTxState;
  title?: string;
  intent?: Intent;
  icon?: ReactNode;
  children?: ReactNode;
}

export const VegaTransactionDialog = ({
  isOpen,
  onChange,
  transaction,
  title,
  intent,
  icon,
  children,
}: VegaTransactionDialogProps) => {
  const defaultProps = useDefaultProps(transaction);
  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      intent={intent || defaultProps.intent}
    >
      <DialogWrapper
        title={title || defaultProps.title}
        icon={icon || defaultProps.icon}
      >
        {children || defaultProps.content}
      </DialogWrapper>
    </Dialog>
  );
};

interface DialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const DialogWrapper = ({
  children,
  icon,
  title,
}: DialogWrapperProps) => {
  return (
    <div className="flex gap-12 max-w-full text-ui">
      <div className="pt-8 fill-current">{icon}</div>
      <div className="flex-1">
        <h1 className="text-h4 text-black dark:text-white capitalize mb-12">
          {title}
        </h1>
        <div className="text-black-40 dark:text-white-40">{children}</div>
      </div>
    </div>
  );
};

const useDefaultProps = (transaction: VegaTxState) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return {
        title: 'Confirm transaction in Vega wallet',
        intent: Intent.Warning,
        icon: <Icon name="hand-up" size={20} />,
        content: (
          <p>
            {t(
              'Please open your wallet application and confirm or reject the transaction'
            )}
          </p>
        ),
      };
    case VegaTxStatus.Pending:
      return {
        title: 'Awaiting transaction',
        intent: Intent.None,
        icon: <Loader size="small" />,
        content: (
          <p className="break-all">
            {t('Waiting for confirmation')} -{' '}
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </a>
          </p>
        ),
      };
    case VegaTxStatus.Error:
      return {
        title: 'Transaction rejected by wallet',
        icon: <Icon name="warning-sign" size={20} />,
        intent: Intent.Danger,
        content: (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {get(transaction.error, 'error') ??
              JSON.stringify(transaction.error, null, 2)}
          </pre>
        ),
      };
    case VegaTxStatus.Complete:
      return {
        title: 'Transaction complete',
        icon: <Icon name="tick" size={20} />,
        intent: Intent.Success,
        content: (
          <p className="break-all">
            {t('Transaction seen on chain')} -{' '}
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </a>
          </p>
        ),
      };
    default:
      return {
        title: '',
        icon: null,
        intent: undefined,
        content: null,
      };
  }
};
