import { useCallback, useState } from 'react';
import { useVegaWallet, SendTxError, Transaction } from '@vegaprotocol/wallet';

export enum VegaTxStatus {
  Default = 'Default',
  AwaitingConfirmation = 'AwaitingConfirmation',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export interface TransactionState {
  status: VegaTxStatus;
  error: object | null;
  hash: string | null;
  signature: string | null;
}

export const useVegaTransaction = () => {
  const { sendTx } = useVegaWallet();
  const [transaction, _setTransaction] = useState<TransactionState>({
    status: VegaTxStatus.Default,
    error: null,
    hash: null,
    signature: null,
  });

  const setTransaction = useCallback((update: Partial<TransactionState>) => {
    _setTransaction((curr) => ({
      ...curr,
      ...update,
    }));
  }, []);

  const handleError = useCallback(
    (error: SendTxError) => {
      setTransaction({ error, status: VegaTxStatus.Rejected });
    },
    [setTransaction]
  );

  const send = useCallback(
    async (tx: Transaction) => {
      setTransaction({
        error: null,
        hash: null,
        signature: null,
        status: VegaTxStatus.AwaitingConfirmation,
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
      } else if (res.tx && res.txHash) {
        setTransaction({
          status: VegaTxStatus.Pending,
          hash: res.txHash,
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
    setTransaction({
      error: null,
      hash: null,
      signature: null,
      status: VegaTxStatus.Default,
    });
  }, [setTransaction]);

  return { send, transaction, reset };
};
