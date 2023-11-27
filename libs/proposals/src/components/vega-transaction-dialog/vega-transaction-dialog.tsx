import type { ReactNode } from 'react';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { WalletClientError } from '@vegaprotocol/wallet-client';
import type { VegaTxState } from '../../lib/proposals-hooks/use-vega-transaction';
import { VegaTxStatus } from '../../lib/proposals-hooks/use-vega-transaction';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useT } from '../../use-t';

export type VegaTransactionContentMap = {
  [C in VegaTxStatus]?: JSX.Element;
};
export interface VegaTransactionDialogProps {
  isOpen: boolean;
  transaction: VegaTxState;
  onChange?: (isOpen: boolean) => void;
  intent?: Intent;
  title?: string;
  icon?: ReactNode;
  content?: VegaTransactionContentMap;
}

export const VegaTransactionDialog = ({
  isOpen,
  transaction,
  onChange,
  intent,
  title,
  icon,
  content,
}: VegaTransactionDialogProps) => {
  const t = useT();
  const computedIntent = intent ? intent : getIntent(transaction);
  const computedTitle = title ? title : getTitle(transaction, t);
  const computedIcon = icon ? icon : getIcon(transaction);

  return (
    <Dialog
      open={isOpen}
      onChange={onChange}
      intent={computedIntent}
      title={computedTitle}
      icon={computedIcon}
      size="small"
    >
      <Content transaction={transaction} content={content} />
    </Dialog>
  );
};
interface ContentProps {
  transaction: VegaTxState;
  content?: VegaTransactionContentMap;
}

const Content = ({ transaction, content }: ContentProps) => {
  if (!content) {
    return <VegaDialog transaction={transaction} />;
  }

  if (transaction.status === VegaTxStatus.Default && content.Default) {
    return content.Default;
  }

  if (transaction.status === VegaTxStatus.Requested && content.Requested) {
    return content.Requested;
  }

  if (transaction.status === VegaTxStatus.Pending && content.Pending) {
    return content.Pending;
  }

  if (transaction.status === VegaTxStatus.Error && content.Error) {
    return content.Error;
  }

  if (transaction.status === VegaTxStatus.Complete && content.Complete) {
    return content.Complete;
  }

  return <VegaDialog transaction={transaction} />;
};

interface VegaDialogProps {
  transaction: VegaTxState;
}

/**
 * Default dialog content
 */
export const VegaDialog = ({ transaction }: VegaDialogProps) => {
  const t = useT();
  const { links, network } = useVegaWallet();

  let content = null;
  if (transaction.status === VegaTxStatus.Requested) {
    content = (
      <>
        <p data-testid={transaction.status}>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
        {network !== 'MAINNET' && (
          <p data-testid="testnet-transaction-info">
            {t('[This is {{network}} transaction only]', { network })}
          </p>
        )}
      </>
    );
  }

  if (transaction.status === VegaTxStatus.Error) {
    let messageText = '';
    if (transaction.error instanceof WalletClientError) {
      messageText = `${transaction.error.title}: ${transaction.error.message}`;
    } else if (transaction.error instanceof Error) {
      messageText = transaction.error.message;
    }
    content = <div data-testid={transaction.status}>{messageText}</div>;
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
              href={`${links.explorer}/txs/0x${transaction.txHash}`}
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
              href={`${links.explorer}/txs/0x${transaction.txHash}`}
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

const getTitle = (transaction: VegaTxState, t: ReturnType<typeof useT>) => {
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
