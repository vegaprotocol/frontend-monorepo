import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  ConnectorError,
  ConnectorErrors,
  unknownError,
  type Transaction,
} from '@vegaprotocol/wallet';

export enum VegaTxStatus {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Error = 'Error',
  Complete = 'Complete',
}

export interface VegaTxState {
  status: VegaTxStatus;
  error: ConnectorError | null;
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

        if (!res) {
          return;
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
        if (
          err instanceof ConnectorError &&
          err.code === ConnectorErrors.userRejected.code
        ) {
          reset();
          return;
        }
        setTransaction({
          error: err instanceof ConnectorError ? err : unknownError(),
          status: VegaTxStatus.Error,
        });
        return null;
      }
    },
    [sendTx, setTransaction, reset]
  );

  return {
    send,
    transaction,
    reset,
    setComplete,
    setTransaction,
  };
};
