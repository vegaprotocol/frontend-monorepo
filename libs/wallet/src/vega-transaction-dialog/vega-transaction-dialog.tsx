import { useEnvironment } from '@vegaprotocol/environment';
import get from 'lodash/get';
import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';

export interface VegaTransactionDialogProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  transaction: VegaTxState;
  children?: ReactNode;
  intent?: Intent;
}

export const VegaTransactionDialog = ({
  isOpen,
  onChange,
  transaction,
  children,
  intent,
}: VegaTransactionDialogProps) => {
  const computedIntent = intent ? intent : getIntent(transaction);
  // Each dialog can specify custom dialog content using data returned via
  // the subscription that confirms the transaction. So if we get a success state
  // and this custom content is provided, render it
  const content =
    transaction.status === VegaTxStatus.Complete && children ? (
      children
    ) : (
      <VegaDialog transaction={transaction} />
    );
  return (
    <Dialog open={isOpen} onChange={onChange} intent={computedIntent}>
      {content}
    </Dialog>
  );
};

interface VegaDialogProps {
  transaction: VegaTxState;
}

/**
 * Default dialog content
 */
const VegaDialog = ({ transaction }: VegaDialogProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();

  if (transaction.status === VegaTxStatus.Requested) {
    return (
      <OrderDialogWrapper
        title="Confirm transaction in wallet"
        icon={<Icon name="hand-up" size={20} />}
      >
        <p>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
      </OrderDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Error) {
    return (
      <OrderDialogWrapper
        title="Order rejected by wallet"
        icon={<Icon name="warning-sign" size={20} />}
      >
        {transaction.error && (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {get(transaction.error, 'error') ??
              JSON.stringify(transaction.error, null, 2)}
          </pre>
        )}
      </OrderDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Pending) {
    return (
      <OrderDialogWrapper
        title="Awaiting network confirmation"
        icon={<Loader size="small" />}
      >
        {transaction.txHash && (
          <p className="break-all">
            {t('Please wait for your transaction to be confirmed')} - &nbsp;
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
        )}
      </OrderDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Complete) {
    return (
      <OrderDialogWrapper
        title="Transaction complete"
        icon={<Icon name="tick" />}
      >
        {transaction.txHash && (
          <p className="break-all">
            {t('Your transaction has been confirmed')} - &nbsp;
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
        )}
      </OrderDialogWrapper>
    );
  }

  return null;
};

interface OrderDialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const OrderDialogWrapper = ({
  children,
  icon,
  title,
}: OrderDialogWrapperProps) => {
  const headerClassName = 'text-h4 font-bold text-black dark:text-white';
  return (
    <div className="flex gap-12 max-w-full">
      <div className="pt-8 fill-current">{icon}</div>
      <div data-testid="order-wrapper" className="flex-1">
        <h1 data-testid="order-status-header" className={headerClassName}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

const getIntent = (transaction: VegaTxState) => {
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return Intent.Warning;
    case VegaTxStatus.Pending:
      return Intent.Warning;
    case VegaTxStatus.Error:
      return Intent.Danger;
    case VegaTxStatus.Complete:
      return Intent.Success;
    default:
      return Intent.None;
  }
};
