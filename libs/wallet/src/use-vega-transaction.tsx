import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  WalletClientError,
  WalletHttpError,
} from '@vegaprotocol/wallet-client';
import { useVegaWallet } from './use-vega-wallet';
import type { VegaTransactionContentMap } from './vega-transaction-dialog';
import { VegaTransactionDialog } from './vega-transaction-dialog';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import type { Transaction } from './connectors';
import { WalletError } from './connectors';
import { ClientErrors } from './connectors';
import type { VegaTxState } from './types';
import { VegaTxStatus } from './types';

export interface DialogProps {
  intent?: Intent;
  title?: string;
  icon?: ReactNode;
  content?: VegaTransactionContentMap;
}

export const initialState = {
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

export const orderErrorResolve = (err: Error | unknown): Error => {
  if (err instanceof WalletClientError || err instanceof WalletError) {
    return err;
  } else if (err instanceof WalletHttpError) {
    return ClientErrors.UNKNOWN;
  } else if (err instanceof TypeError) {
    return ClientErrors.NO_SERVICE;
  } else if (err instanceof Error) {
    return err;
  }
  return ClientErrors.UNKNOWN;
};

export const useVegaTransaction = () => {
  const { sendTx, disconnect } = useVegaWallet();
  const [transaction, _setTransaction] = useState<VegaTxState>(initialState);

  const setTransaction = useCallback((update: Partial<VegaTxState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  const setComplete = useCallback(() => {
    setTransaction({ status: VegaTxStatus.Complete });
  }, [setTransaction]);

  const send = useCallback(
    async (pubKey: string, tx: Transaction) => {
      try {
        setTransaction({
          error: null,
          txHash: null,
          signature: null,
          status: VegaTxStatus.Requested,
          dialogOpen: true,
        });

        const res = await sendTx(pubKey, tx);

        if (res === null) {
          // User rejected
          reset();
          return null;
        }

        if (res.signature && res.transactionHash) {
          setTransaction({
            status: VegaTxStatus.Pending,
            txHash: res.transactionHash,
            signature: res.signature,
          });

          return res;
        }

        return null;
      } catch (err) {
        const error = orderErrorResolve(err);
        if ((error as WalletError).code === ClientErrors.NO_SERVICE.code) {
          disconnect();
        }
        setTransaction({
          error,
          status: VegaTxStatus.Error,
        });
        return null;
      }
    },
    [sendTx, setTransaction, reset, disconnect]
  );

  const Dialog = useMemo(() => {
    return (props: DialogProps) => (
      <VegaTransactionDialog
        {...props}
        isOpen={transaction.dialogOpen}
        onChange={(isOpen) => {
          if (!isOpen) reset();
          setTransaction({ dialogOpen: isOpen });
        }}
        transaction={transaction}
      />
    );
  }, [transaction, setTransaction, reset]);

  return {
    send,
    transaction,
    reset,
    setComplete,
    setTransaction,
    Dialog,
  };
};
