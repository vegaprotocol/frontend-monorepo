import { useState } from 'react';
import { useVegaWallet } from './use-vega-wallet';
import {
  ConnectorError,
  ConnectorErrors,
  determineId,
  type Transaction,
} from '@vegaprotocol/wallet';
import {
  useSimpleTransactionSubscription,
  type SimpleTransactionFieldsFragment,
} from '../__generated__/SimpleTransaction';
import { useT } from './use-t';

export type Status = 'idle' | 'requested' | 'pending' | 'confirmed';

export type Result = {
  txHash: string;
  signature: string;
  id: string;
};

export type Options = {
  onSuccess?: (result: Result) => void;
  onError?: (msg: string) => void;
};

export const useSimpleTransaction = (opts?: Options) => {
  const t = useT();
  const { pubKey, isReadOnly, sendTx } = useVegaWallet();

  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();

  const reset = () => {
    setStatus('idle');
    setResult(undefined);
    setError(undefined);
  };

  const send = async (tx: Transaction) => {
    if (!pubKey) {
      throw new Error('no pubKey');
    }

    if (isReadOnly) {
      throw new Error('cant submit in read only mode');
    }

    setStatus('requested');
    setError(undefined);

    try {
      const res = await sendTx(pubKey, tx);

      setStatus('pending');
      setResult({
        txHash: res?.transactionHash.toLowerCase(),
        signature: res.signature,
        id: determineId(res.signature),
      });
    } catch (err) {
      if (err instanceof ConnectorError) {
        if (err.code === ConnectorErrors.userRejected.code) {
          setStatus('idle');
        } else {
          setError(`${err.message}${err.data ? `: ${err.data}` : ''}`);
          setStatus('idle');
          opts?.onError?.(err.message);
        }
      } else {
        const msg = t('Something went wrong');
        setError(msg);
        setStatus('idle');
        opts?.onError?.(msg);
      }
    }
  };

  useSimpleTransactionSubscription({
    variables: { partyId: pubKey || '' },
    skip: !pubKey || !result,
    fetchPolicy: 'no-cache',
    onData: ({ data }) => {
      if (!result) {
        throw new Error('simple transaction query started before result');
      }

      const e = data.data?.busEvents?.find((event) => {
        if (
          event.event.__typename === 'TransactionResult' &&
          event.event.hash.toLowerCase() === result?.txHash
        ) {
          return true;
        }

        return false;
      });

      if (!e) return;

      // Force type narrowing
      const event = e.event as SimpleTransactionFieldsFragment;

      if (event.status && !event.error) {
        setStatus('confirmed');
        opts?.onSuccess?.(result);
      } else {
        const msg = event?.error || t('Transaction was not successful');
        setError(msg);
        setStatus('idle');
        opts?.onError?.(msg);
      }
    },
  });

  return {
    result,
    error,
    status,
    send,
    reset,
  };
};
