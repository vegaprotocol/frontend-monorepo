import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { TransactionSubmission } from './wallet-types';
import { useVegaWallet } from './use-vega-wallet';
import type { SendTxError } from './context';
import { VegaTransactionDialog } from './vega-transaction-dialog';

export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  Complete = 'Complete',
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: object | null;
  txHash: string | null;
  signature: string | null;
  dialogOpen: boolean;
}

export const initialState = {
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
  dialogOpen: false,
};

export const useVegaTransaction = () => {
  const { sendTx } = useVegaWallet();
  const [transaction, _setTransaction] = useState<VegaTxState>(initialState);

  const setTransaction = useCallback((update: Partial<VegaTxState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const handleError = useCallback(
    (error: SendTxError) => {
      setTransaction({ error, status: VegaTxStatus.Error });
    },
    [setTransaction]
  );

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  const setComplete = useCallback(() => {
    setTransaction({ status: VegaTxStatus.Complete });
  }, [setTransaction]);

  const send = useCallback(
    async (tx: TransactionSubmission) => {
      setTransaction({
        error: null,
        txHash: null,
        signature: null,
        status: VegaTxStatus.Requested,
        dialogOpen: true,
      });

      const res = await sendTx(tx);

      if (res === null) {
        setTransaction({ status: VegaTxStatus.Default });
        return null;
      }
      if ('errors' in res) {
        handleError(res);
      } else if ('error' in res) {
        if (res.error === 'User rejected') {
          reset();
        } else {
          handleError(res);
        }
      } else if (res.tx?.signature?.value && res.txHash) {
        setTransaction({
          status: VegaTxStatus.Pending,
          txHash: res.txHash,
          signature: res.tx.signature.value,
        });
        return {
          signature: res.tx.signature?.value,
        };
      }

      return null;
    },
    [sendTx, handleError, setTransaction, reset]
  );

  const Dialog = useMemo(() => {
    return ({ children }: { children?: ReactNode }) => (
      <VegaTransactionDialog
        isOpen={transaction.dialogOpen}
        onChange={(isOpen) => {
          if (!isOpen) reset();
          setTransaction({ dialogOpen: isOpen });
        }}
        transaction={transaction}
      >
        {children}
      </VegaTransactionDialog>
    );
  }, [transaction, setTransaction, reset]);

  return { send, transaction, reset, setComplete, Dialog };
};
