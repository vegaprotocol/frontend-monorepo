import type { TxData } from '@vegaprotocol/smart-contracts-sdk';
import { Dialog, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Tick } from '../icons';

const TransactionModalTh = ({ children }: { children: React.ReactNode }) => (
  <th className="border-b border-black-25 text-black-60 text-left font-normal">
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
  const { transactions } = useContracts();
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
