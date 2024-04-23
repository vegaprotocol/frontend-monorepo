import type { ReactNode } from 'react';
import { Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '../../lib/proposals-hooks/use-vega-transaction';
import { VegaTxStatus } from '../../lib/proposals-hooks/use-vega-transaction';
import { useT } from '../../use-t';
import {
  DApp,
  EXPLORER_TX,
  useEnvironment,
  useLinks,
} from '@vegaprotocol/environment';

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
  const { VEGA_ENV } = useEnvironment();
  const link = useLinks(DApp.Explorer);

  const explorerLink = transaction.txHash ? (
    <a
      className="underline"
      data-testid="tx-block-explorer"
      href={link(EXPLORER_TX.replace(':hash', transaction.txHash))}
      target="_blank"
      rel="noreferrer"
    >
      {t('View in block explorer')}
    </a>
  ) : null;

  let content = null;
  if (transaction.status === VegaTxStatus.Requested) {
    content = (
      <>
        <p data-testid={transaction.status}>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
        {VEGA_ENV !== 'MAINNET' && (
          <p data-testid="testnet-transaction-info">
            {t('[This is {{network}} transaction only]', { network: VEGA_ENV })}
          </p>
        )}
      </>
    );
  }

  if (transaction.status === VegaTxStatus.Error) {
    content = (
      <div data-testid={transaction.status} className="first-letter:capitalize">
        <p>{transaction.error?.message}</p>
        <p>{transaction.error?.data}</p>
        {explorerLink && <p>{explorerLink}</p>}
      </div>
    );
  }

  if (transaction.status === VegaTxStatus.Pending) {
    content = (
      <div data-testid={transaction.status}>
        <p className="break-all">
          {t('Please wait for your transaction to be confirmed')} - &nbsp;
          {explorerLink}
        </p>
      </div>
    );
  }

  if (transaction.status === VegaTxStatus.Complete) {
    content = (
      <div data-testid={transaction.status}>
        <p className="break-all">
          {t('Your transaction has been confirmed')} - &nbsp;
          {explorerLink}
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
