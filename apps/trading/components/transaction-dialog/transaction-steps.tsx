import { type Status, type Result, TxStatus } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import {
  ConfirmedBadge,
  DefaultBadge,
  FailedBadge,
  PendingBadge,
} from './transaction-badge';
import { type ReactNode } from 'react';
import {
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';

type TransactionStepsProps = {
  error?: string;
  result?: Result;
  status: Status;
  reset: () => void;
  resetLabel?: ReactNode;
  confirmedLabel?: ReactNode;
};

const isFinal = (status: Status) =>
  [TxStatus.Confirmed, TxStatus.Failed, TxStatus.Rejected].includes(
    status as TxStatus
  );

export const TransactionSteps = ({
  error,
  result,
  status,
  reset,
  resetLabel,
  confirmedLabel,
}: TransactionStepsProps) => {
  const t = useT();

  const explorerLink = useLinks(DApp.Explorer);

  let aStepIcon = <DefaultBadge />;
  let bStepIcon = <DefaultBadge />;

  let aStepDescription: ReactNode = undefined;
  let bStepDescription: ReactNode = undefined;

  if (status === TxStatus.Rejected) {
    if (error) {
      aStepDescription = (
        <span className="text-vega-red-500 break-all">{error}</span>
      );
    } else {
      aStepDescription = (
        <span className="text-vega-red-500">
          {t('Transaction rejected by user')}
        </span>
      );
    }
  }

  if (result?.txHash) {
    aStepDescription = (
      <a
        className="text-muted inline-flex gap-1 items-center hover:underline"
        href={explorerLink(EXPLORER_TX.replace(':hash', result.txHash))}
        title={t('View on explorer')}
      >
        <span>{t('Transaction submitted successfully')}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
      </a>
    );
  }

  if (status === TxStatus.Confirmed && confirmedLabel) {
    bStepDescription = (
      <span className="text-vega-green-500">{confirmedLabel}</span>
    );
  }

  if (status === TxStatus.Failed && error) {
    bStepDescription = (
      <span className="text-vega-red-500 break-all">{error}</span>
    );
  }

  let resetButtonLabel = resetLabel;
  if (!resetButtonLabel) {
    resetButtonLabel = t('Back');
  }

  switch (status) {
    default:
    case TxStatus.Idle:
      aStepIcon = <DefaultBadge />;
      bStepIcon = <DefaultBadge />;
      break;
    case TxStatus.Requested:
      aStepIcon = <PendingBadge />;
      bStepIcon = <DefaultBadge />;
      break;
    case TxStatus.Rejected: {
      aStepIcon = <FailedBadge />;

      bStepIcon = <DefaultBadge />;
      break;
    }
    case TxStatus.Pending: {
      aStepIcon = <ConfirmedBadge />;
      bStepIcon = <PendingBadge />;
      break;
    }
    case TxStatus.Failed: {
      aStepIcon = <ConfirmedBadge />;
      bStepIcon = <FailedBadge />;
      break;
    }
    case TxStatus.Confirmed:
      aStepIcon = <ConfirmedBadge />;
      bStepIcon = <ConfirmedBadge />;
      break;
  }

  return (
    <div className="flex flex-col gap-6">
      <p>
        {t(
          "Approve the transaction in your Vega wallet. If you have multiple wallets, you'll need to choose which to approve with."
        )}
      </p>
      <ul className="flex flex-col gap-4">
        <li className="flex flex-row items-center gap-4">
          {aStepIcon}
          <div className="flex flex-col gap-0">
            <span>{t('Submit transaction')}</span>
            {aStepDescription && <span>{aStepDescription}</span>}
          </div>
        </li>
        <li className="flex flex-row flex-grow-0 items-center gap-4">
          {bStepIcon}
          <div className="flex flex-col gap-0 min-w-0">
            <span>{t('Confirm transaction')}</span>
            {bStepDescription && <span>{bStepDescription}</span>}
          </div>
        </li>
      </ul>
      {isFinal(status) && (
        <TradingButton size="large" onClick={reset}>
          {resetButtonLabel}
        </TradingButton>
      )}
    </div>
  );
};
