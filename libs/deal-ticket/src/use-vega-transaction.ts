import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
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

  const send = useCallback(
    async (tx: OrderSubmissionBody) => {
      setError(null);
      setTx(null);
      setStatus(VegaTxStatus.AwaitingConfirmation);

      const res = await sendTx(tx);

      if (res === null) {
        // No op, user not connected to wallet
        return null;
      }

      // Can't combine the checks for error/errors as TS can't seem to infer properly
      if ('error' in res) {
        setError(res);
        setStatus(VegaTxStatus.Rejected);
        return null;
      } else if ('errors' in res) {
        setError(res);
        setStatus(VegaTxStatus.Rejected);
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
    [sendTx]
  );

  return { send, status, setStatus, tx, error };
};
