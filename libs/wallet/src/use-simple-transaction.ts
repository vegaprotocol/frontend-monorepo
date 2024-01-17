import { useState } from 'react';
import { useVegaWallet } from './use-vega-wallet';
import { type Transaction } from './connectors';
import {
  useSimpleTransactionSubscription,
  type SimpleTransactionFieldsFragment,
} from './__generated__/SimpleTransaction';
import { useT } from './use-t';

export type Status = 'idle' | 'requested' | 'pending' | 'confirmed';

type Options = {
  onSuccess?: (hash: string) => void;
  onError?: (msg: string) => void;
};

export const useSimpleTransaction = (opts?: Options) => {
  const t = useT();
  const { pubKey, isReadOnly, sendTx } = useVegaWallet();

  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const send = async (tx: Transaction) => {
    if (!pubKey) {
      throw new Error('no pubKey');
    }

    if (isReadOnly) {
      throw new Error('cant submit in read only mode');
    }

    setStatus('requested');

    try {
      const res = await sendTx(pubKey, tx);

      if (!res) {
        throw new Error(t('Transaction could not be sent'));
      }

      setStatus('pending');
      setTxHash(res?.transactionHash.toLowerCase());
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setStatus('idle');
        } else {
          setError(err.message);
          opts?.onError?.(err.message);
        }
      } else {
        const msg = t('Wallet rejected transaction');
        setError(msg);
        opts?.onError?.(msg);
      }
    }
  };

  useSimpleTransactionSubscription({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
    fetchPolicy: 'no-cache',
    onData: ({ data: result }) => {
      const e = result.data?.busEvents?.find((event) => {
        if (
          event.event.__typename === 'TransactionResult' &&
          event.event.hash.toLowerCase() === txHash
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
        opts?.onSuccess?.(event.hash);
      } else {
        const msg = event?.error || t('Transaction was not successful');
        setError(msg);
        opts?.onError?.(msg);
      }
    },
  });

  return {
    txHash,
    error,
    status,
    send,
  };
};
