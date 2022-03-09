import { useCallback, useState } from 'react';
import { Order } from '../../hooks/use-order-state';

// TODO: Replace this with one provided by vega wallet
const commandSync = (arg: any): Promise<any> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({
        txHash: Math.random().toString(),
        tx: { signature: { value: 'FOO' } },
      });
    }, 1500);
  });

export const useOrderSubmit = (marketId: string) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const submit = useCallback(
    async (order: Order) => {
      try {
        setLoading(true);
        setError('');
        setTxHash('');
        const res = await commandSync({
          pubKey: 'TODO_pubkey',
          orderSubmission: {
            reference: 'TODO_reference',
            marketId,
            price: order.price,
            size: order.size,
            type: order.type,
            side: order.side,
            timeInForce: order.timeInForce,
            // wallet expects nanoseconds but client uses just ms
            // expiresAt: variables.expiration
            //   ? msToNano(variables.expiration)
            //   : undefined,
            expiresAt: undefined, // TODO: convert to nanoseconds
          },
        });

        setTxHash(res.txHash);
        console.log(`Order tx sent to network: ${res.txHash}`);

        /*
        TODO: 
        - Create order id using signature, see sigToId function in TFE
        - Write order optimistically to apollo cache 
        */
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [marketId]
  );

  return {
    submit,
    error,
    loading,
    txHash,
  };
};
