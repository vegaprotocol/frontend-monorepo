import { Networks, useEnvironment } from '@vegaprotocol/environment';
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
  title?: string;
  icon?: ReactNode;
}

export const VegaTransactionDialog = ({
  isOpen,
  onChange,
  transaction,
  children,
  intent,
  title,
  icon,
}: VegaTransactionDialogProps) => {
  const computedIntent = intent ? intent : getIntent(transaction);
  const computedTitle = title ? title : getTitle(transaction);
  const computedIcon = icon ? icon : getIcon(transaction);
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
    <Dialog
      open={isOpen}
      onChange={onChange}
      intent={computedIntent}
      title={computedTitle}
      icon={computedIcon}
      size="small"
    >
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
export const VegaDialog = ({ transaction }: VegaDialogProps) => {
  const { VEGA_EXPLORER_URL, VEGA_ENV } = useEnvironment();

  let content = null;
  if (transaction.status === VegaTxStatus.Requested) {
    content = (
      <>
        <p data-testid={transaction.status}>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
        {VEGA_ENV !== Networks.MAINNET && (
          <p data-testid="testnet-transaction-info">
            {t('[This is %s transaction]').replace('%s', VEGA_ENV)}
          </p>
        )}
      </>
    );
  }

  if (transaction.status === VegaTxStatus.Error) {
    content = (
      <div data-testid={transaction.status}>
        <p>{transaction.error && transaction.error.message}</p>
        {transaction.error && transaction.error.data && (
          <p>{transaction.error.data}</p>
        )}
      </div>
    );
  }

  if (transaction.status === VegaTxStatus.Pending) {
    content = (
      <div data-testid={transaction.status}>
        <p className="break-all">
          {t('Please wait for your transaction to be confirmed')} - &nbsp;
          {transaction.txHash && (
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </a>
          )}
        </p>
      </div>
    );
  }

  if (transaction.status === VegaTxStatus.Complete) {
    content = (
      <div data-testid={transaction.status}>
        <p className="break-all">
          {t('Your transaction has been confirmed')} - &nbsp;
          {transaction.txHash && (
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </a>
          )}
        </p>
      </div>
    );
  }

  return <div className="text-sm">{content}</div>;
};

const getIntent = (transaction: VegaTxState) => {
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return Intent.Warning;
    case VegaTxStatus.Pending:
      return Intent.None;
    case VegaTxStatus.Error:
      return Intent.Danger;
    case VegaTxStatus.Complete:
      return Intent.Success;
    default:
      return Intent.None;
  }
};

const getTitle = (transaction: VegaTxState) => {
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return t('Confirm transaction in wallet');
    case VegaTxStatus.Pending:
      return t('Awaiting network confirmation');
    case VegaTxStatus.Error:
      return t('Transaction failed');
    case VegaTxStatus.Complete:
      return t('Transaction complete');
    default:
      return '';
  }
};

const getIcon = (transaction: VegaTxState) => {
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return <Icon name="hand-up" />;
    case VegaTxStatus.Pending:
      return (
        <span className="mt-1">
          <Loader size="small" />
        </span>
      );
    case VegaTxStatus.Error:
      return <Icon name="warning-sign" />;
    case VegaTxStatus.Complete:
      return <Icon name="tick" />;
    default:
      return '';
  }
};
