import { useCallback, useState } from 'react';
import type { TransactionSubmission } from './types';
import { useVegaWallet } from './hooks';
import type { SendTxError } from './context';

export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  // Note no complete state as we have to use api calls/subs to check if
  // our transaction was completed
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: object | null;
  txHash: string | null;
  signature: string | null;
}

export const initialState = {
  status: VegaTxStatus.Default,
  error: null,
  txHash: null,
  signature: null,
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

  const send = useCallback(
    async (tx: TransactionSubmission) => {
      setTransaction({
        error: null,
        txHash: null,
        signature: null,
        status: VegaTxStatus.Requested,
      });

      const res = await sendTx(tx);

      if (res === null) {
        setTransaction({ status: VegaTxStatus.Default });
        return null;
      }

      if ('error' in res) {
        handleError(res);
        return null;
      } else if ('errors' in res) {
        handleError(res);
        return null;
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
    [sendTx, handleError, setTransaction]
  );

  const reset = useCallback(() => {
    setTransaction(initialState);
  }, [setTransaction]);

  return { send, transaction, reset };
};
