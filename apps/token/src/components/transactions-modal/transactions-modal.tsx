import { Overlay } from '@blueprintjs/core';
import type { TxData } from '@vegaprotocol/smart-contracts-sdk';
import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { truncateMiddle } from '../../lib/truncate-middle';
import { Tick } from '../icons';
import { Loader } from '../loader';
import { Modal } from '../modal';

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
  const { t } = useTranslation();
  const { transactions } = useContracts();
  const { appState, appDispatch } = useAppState();

  const close = React.useCallback(
    () =>
      appDispatch({
        type: AppStateActionType.SET_TRANSACTION_OVERLAY,
        isOpen: false,
      }),
    [appDispatch]
  );

  const renderStatus = (txObj: TxData) => {
    if (!txObj.receipt) {
      return (
        <TransactionModalStatus>
          <Loader invert={true} />
          <span>{t('pending')}</span>
        </TransactionModalStatus>
      );
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
        <Loader invert={true} />
        <span>
          {t('confirmationsRemaining', {
            confirmations: txObj.receipt.confirmations,
            required: txObj.requiredConfirmations,
          })}
        </span>
      </TransactionModalStatus>
    );
  };

  return (
    <Overlay
      className="bp3-dark"
      isOpen={appState.transactionOverlay}
      onClose={close}
      transitionDuration={0}
    >
      <div className="modal">
        <Modal title={t('ethTransactionModalTitle')}>
          {transactions.length ? (
            <table className="w-full">
              <thead>
                <tr>
                  <TransactionModalTh>{t('transaction')}</TransactionModalTh>
                  <TransactionModalTh>{t('status')}</TransactionModalTh>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  return (
                    <tr key={t.tx.hash}>
                      <TransactionModalTd>
                        <EtherscanLink
                          tx={t.tx.hash}
                          text={truncateMiddle(t.tx.hash)}
                        />
                      </TransactionModalTd>
                      <TransactionModalTd>{renderStatus(t)}</TransactionModalTd>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>{t('noTransactions')}</p>
          )}
        </Modal>
      </div>
    </Overlay>
  );
};
