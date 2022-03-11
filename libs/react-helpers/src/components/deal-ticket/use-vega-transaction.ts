import { useCallback, useState } from 'react';
import { useVegaWallet } from '../vega-wallet';
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
  const [error, setError] = useState('');

  const handleError = (
    // TODO: Figure out the best way to type this
    // eslint-disable-next-line
    err: any
  ) => {
    setStatus(VegaTxStatus.Rejected);

    // Fetch failed
    if (err instanceof TypeError) {
      setError('Wallet not running');
    }
    // Bad request
    else if (err?.code === 400) {
      setError('Transaction invalid');
    }
    // Something unknown
    else {
      setError('Something went wrong');
    }
  };

  const send = useCallback(
    async (tx: OrderSubmissionBody) => {
      try {
        setTx(null);
        setStatus(VegaTxStatus.AwaitingConfirmation);
        const res = await sendTx(tx);

        // Transaction accepted by wallet and boradcast to network
        if (res?.tx && res.txHash) {
          setTx(res);
          setStatus(VegaTxStatus.Pending);
          return res;
        }
        // Wallet rejected the transaction, probably invalid input
        else {
          handleError(res);
          return null;
        }
      } catch (err) {
        handleError(err);
        return null;
      }
    },
    [sendTx]
  );

  return { send, status, setStatus, tx, error };
};
