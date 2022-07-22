import { useEnvironment } from '@vegaprotocol/environment';
import get from 'lodash/get';
import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import { VegaTransactionDialogWrapper } from './vega-transaction-dialog-wrapper';

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
      <VegaTransactionDialogWrapper
        title="Confirm transaction in wallet"
        icon={<Icon name="hand-up" size={20} />}
      >
        <p>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
      </VegaTransactionDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Error) {
    return (
      <VegaTransactionDialogWrapper
        title="Order rejected by wallet"
        icon={<Icon name="warning-sign" size={20} />}
      >
        {transaction.error && (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {get(transaction.error, 'error') ??
              JSON.stringify(transaction.error, null, 2)}
          </pre>
        )}
      </VegaTransactionDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Pending) {
    return (
      <VegaTransactionDialogWrapper
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
      </VegaTransactionDialogWrapper>
    );
  }

  if (transaction.status === VegaTxStatus.Complete) {
    return (
      <VegaTransactionDialogWrapper
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
      </VegaTransactionDialogWrapper>
    );
  }

  return null;
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
