import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TransactionState } from '../../hooks/transaction-reducer';
import { TxState } from '../../hooks/transaction-reducer';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Button, Link } from '@vegaprotocol/ui-toolkit';
import { Error, HandUp, Tick } from '../icons';
import { Loader } from '../loader';
import { StatefulButton } from '../stateful-button';

interface TransactionButtonProps {
  text: string;
  transactionState: TransactionState;
  /** txHash of the transaction if already complete */
  forceTxHash: string | null;
  forceTxState?: TxState;
  disabled?: boolean;
  start: () => void;
  reset: () => void;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-20">{children}</div>
);

const Text = ({ children }: { children: React.ReactNode }) => (
  <p className="flex justify-center items-center gap-10 m-0 py-12 px-32 leading-[1.15]">
    {children}
  </p>
);

export const TransactionButton = ({
  text,
  transactionState,
  forceTxHash,
  forceTxState,
  disabled = false,
  start,
  reset,
}: TransactionButtonProps) => {
  const { t } = useTranslation();
  const { txState, txData } = transactionState;
  const txHash = forceTxHash || txData.hash;
  const state = forceTxState || txState;

  if (state === TxState.Complete) {
    return (
      <Wrapper>
        <Text>
          <span className="text-vega-green">
            <Tick />
          </span>
          <span>{t('txButtonComplete')}</span>
        </Text>
        <TransactionButtonFooter txHash={txHash} />
      </Wrapper>
    );
  }

  // User as started transaction and we are awaiting confirmation from the users wallet
  if (state === TxState.Requested) {
    return (
      <Wrapper>
        <StatefulButton disabled={true}>
          <HandUp />
          <span>{t('txButtonActionRequired')}</span>
        </StatefulButton>
        <TransactionButtonFooter
          message={t('transactionHashPrompt')}
          txHash={txHash}
        />
      </Wrapper>
    );
  }

  if (state === TxState.Pending) {
    return (
      <Wrapper>
        <StatefulButton disabled={true}>
          <Loader />
          <span>{t('txButtonAwaiting')}</span>
        </StatefulButton>
        <TransactionButtonFooter txHash={txHash} />
      </Wrapper>
    );
  }

  if (state === TxState.Error) {
    return (
      <Wrapper>
        <Text>
          <span className="text-intent-danger">
            <Error />
          </span>
          <span>{t('txButtonFailure')}</span>
          <Button onClick={reset} variant="inline-link">
            {t('Try again')}
          </Button>
        </Text>
        <TransactionButtonFooter txHash={txHash} />
      </Wrapper>
    );
  }

  // Idle
  return (
    <Wrapper>
      <StatefulButton onClick={start} disabled={disabled}>
        {text}
      </StatefulButton>
      <TransactionButtonFooter txHash={txHash} />
    </Wrapper>
  );
};

interface TransactionButtonFooterProps {
  txHash: string | null;
  message?: string;
}

export const TransactionButtonFooter = ({
  txHash,
  message,
}: TransactionButtonFooterProps) => {
  const { t } = useTranslation();

  if (message) {
    return (
      <div className="mt-4 mb-0 mx-0">
        <p className="m-0 py-4 pl-8 border-l border-[3px] border-intent-warning text-ui">
          <span className="relative top-2 mr-4 text-intent-warning">
            <Error />
          </span>
          {message}
        </p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="transaction-button__footer">
        <p className="flex justify-between items-start m-0 text-ui">
          <span>{t('transaction')}</span>
          <Link
            href={`${process.env['NX_ETHERSCAN_URL']}/tx/${txHash}`}
            title={t('View on Etherscan')}
          >
            {truncateMiddle(txHash)}
          </Link>
        </p>
      </div>
    );
  }

  return null;
};
