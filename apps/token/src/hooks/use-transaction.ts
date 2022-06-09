import React from 'react';
import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';
import type { ethers } from 'ethers';
import { isUnexpectedError, isUserRejection } from '../lib/web3-utils';
import {
  initialState,
  TransactionActionType,
  transactionReducer,
} from './transaction-reducer';
import { useTransactionStore } from '../stores/transactions';

export const useTransaction = (
  performTransaction: () => Promise<ethers.ContractTransaction>,
  requiredConfirmations = 1
) => {
  const { t } = useTranslation();
  const store = useTransactionStore();
  const [state, dispatch] = React.useReducer(transactionReducer, {
    ...initialState,
    requiredConfirmations,
  });

  const handleError = React.useCallback(
    (err: Error) => {
      if (isUnexpectedError(err)) {
        Sentry.captureException(err);
      }

      if (isUserRejection(err)) {
        dispatch({ type: TransactionActionType.TX_RESET });
        return;
      } else {
        Sentry.captureException(err);
      }

      const defaultMessage = t('Something went wrong');
      const errorSubstitutions = {
        unknown: defaultMessage,
        'Transaction has been reverted by the EVM': defaultMessage,
      };
      dispatch({
        type: TransactionActionType.TX_ERROR,
        error: err,
        errorSubstitutions,
      });
    },
    [dispatch, t]
  );

  const perform = React.useCallback(async () => {
    dispatch({
      type: TransactionActionType.TX_REQUESTED,
    });

    Sentry.addBreadcrumb({
      type: 'Transaction',
      level: Sentry.Severity.Log,
      message: 'Transaction requested',
      timestamp: Date.now(),
    });

    try {
      const tx = await performTransaction();

      store.add({ tx, receipt: null, pending: true, requiredConfirmations });
      dispatch({
        type: TransactionActionType.TX_SUBMITTED,
        txHash: tx.hash,
      });

      Sentry.addBreadcrumb({
        type: 'Transaction',
        level: Sentry.Severity.Log,
        message: 'Transaction submitted',
        data: {
          hash: tx.hash,
          from: tx.from,
          gasLimit: tx.gasLimit.toString(),
          nonce: tx.nonce,
        },
        timestamp: Date.now(),
      });

      let receipt: ethers.ContractReceipt | null = null;

      for (let i = 1; i <= requiredConfirmations; i++) {
        receipt = await tx.wait(i);
        store.update({ tx, receipt, pending: true, requiredConfirmations });
        dispatch({
          type: TransactionActionType.TX_CONFIRMATION,
          confirmations: receipt.confirmations,
        });
      }

      if (!receipt) {
        throw new Error('No receipt after confirmations are met');
      }

      store.update({ tx, receipt, pending: false, requiredConfirmations });
      dispatch({
        type: TransactionActionType.TX_COMPLETE,
        receipt,
        confirmations: receipt.confirmations,
      });

      Sentry.addBreadcrumb({
        type: 'Transaction',
        level: Sentry.Severity.Log,
        message: 'Transaction complete',
        data: {
          blockNumber: receipt.blockNumber,
          confirmations: receipt.confirmations,
          from: receipt.from,
          to: receipt.to,
          transactionHash: receipt.transactionHash,
        },
        timestamp: Date.now(),
      });
    } catch (err) {
      handleError(err as Error);
    }
  }, [performTransaction, requiredConfirmations, handleError, store]);

  const reset = () => {
    dispatch({ type: TransactionActionType.TX_RESET });
  };

  return {
    state,
    dispatch,
    perform,
    reset,
  };
};
