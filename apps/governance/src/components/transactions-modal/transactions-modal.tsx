import { Dialog, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Tick } from '../icons';
import type { TxData } from '../../stores/transactions';
import { useTransactionStore } from '../../stores/transactions';

const TransactionModalTh = ({ children }: { children: React.ReactNode }) => (
  <th className="border-b border-gs-600 text-surface-1-fg text-left font-normal">
    {children}
  </th>
);

const TransactionModalTd = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left font-normal">{children}</th>
);

const TransactionModalStatus = ({
  children,
}: {
  children: React.ReactNode;
}) => <span className="flex gap-4 items-center">{children}</span>;

export const TransactionModal = () => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const { transactions } = useTransactionStore();
  const { appState, appDispatch } = useAppState();

  const renderStatus = (txObj: TxData) => {
    if (!txObj.receipt) {
      return <TransactionModalStatus>{t('pending')}</TransactionModalStatus>;
    }

    if (txObj.receipt.confirmations >= txObj.requiredConfirmations) {
      return (
        <TransactionModalStatus>
          <Tick />
          <span>{t('confirmed')}</span>
        </TransactionModalStatus>
      );
    }

    return (
      <TransactionModalStatus>
        {t('confirmationsRemaining', {
          confirmations: txObj.receipt.confirmations,
          required: txObj.requiredConfirmations,
        })}
      </TransactionModalStatus>
    );
  };

  return (
    <Dialog
      open={appState.transactionOverlay}
      title={t('ethTransactionModalTitle')}
      onChange={(isOpen) =>
        appDispatch({
          type: AppStateActionType.SET_TRANSACTION_OVERLAY,
          isOpen,
        })
      }
    >
      {transactions.length ? (
        <table className="w-full">
          <thead>
            <tr>
              <TransactionModalTh>{t('transaction')}</TransactionModalTh>
              <TransactionModalTh>{t('status')}</TransactionModalTh>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              return (
                <tr key={transaction.tx.hash}>
                  <TransactionModalTd>
                    <Link
                      title={t('View transaction on Etherscan')}
                      target="_blank"
                      href={`${ETHERSCAN_URL}/tx/${transaction.tx.hash}`}
                    >
                      {truncateMiddle(transaction.tx.hash)}
                    </Link>
                  </TransactionModalTd>
                  <TransactionModalTd>
                    {renderStatus(transaction)}
                  </TransactionModalTd>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>{t('noTransactions')}</p>
      )}
    </Dialog>
  );
};
