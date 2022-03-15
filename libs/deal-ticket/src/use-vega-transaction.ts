import { useCallback, useState } from 'react';
import { useVegaWallet, SendTxError } from '@vegaprotocol/wallet';
import {
  OrderSubmissionBody,
  TransactionResponse,
} from '@vegaprotocol/vegawallet-service-api-client';

export enum VegaTxStatus {
  Default = 'Default',
  AwaitingConfirmation = 'AwaitingConfirmation',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export const useVegaTransaction = () => {
  const { sendTx } = useVegaWallet();
  const [status, setStatus] = useState(VegaTxStatus.Default);
  const [tx, setTx] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState<object | null>(null);

  const handleError = useCallback((err: SendTxError) => {
    setError(err);
    setStatus(VegaTxStatus.Rejected);
  }, []);

  const send = useCallback(
    async (tx: OrderSubmissionBody) => {
      setError(null);
      setTx(null);
      setStatus(VegaTxStatus.AwaitingConfirmation);

      const res = await sendTx(tx);

      if (res === null) {
        setStatus(VegaTxStatus.Default);
        return null;
      }

      if ('error' in res) {
        handleError(res);
        return null;
      } else if ('errors' in res) {
        handleError(res);
        return null;
      } else if (res.tx && res.txHash) {
        setTx(res);
        setStatus(VegaTxStatus.Pending);
        return {
          signature: res.tx.signature?.value,
        };
      }

      return null;
    },
    [sendTx, handleError]
  );

  return { send, status, setStatus, tx, error };
};
