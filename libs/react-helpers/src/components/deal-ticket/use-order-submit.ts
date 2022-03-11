import { useCallback, useState } from 'react';
import { Order } from '../../hooks/use-order-state';
import { useVegaWallet } from '../vega-wallet';

export const useOrderSubmit = (marketId: string) => {
  const { keypair, sendTx } = useVegaWallet();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  console.log(keypair);

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair) {
        throw new Error('No keypair provided');
      }

      if (!order.side) {
        throw new Error('No side provided');
      }

      try {
        setLoading(true);
        setError('');
        setTxHash('');
        const res = await sendTx({
          pubKey: keypair.pub,
          propagate: true,
          orderSubmission: {
            reference: '',
            marketId,
            price: order.price,
            size: order.size,
            type: order.type,
            side: order.side,
            timeInForce: order.timeInForce,
            expiresAt: order.expiration
              ? // Wallet expects timestamp in nanoseconds, we don't have that level of accuracy so
                // just append 6 zeroes
                order.expiration.getTime().toString() + '000000'
              : undefined,
          },
        });

        if (!res?.txHash) {
          throw new Error('No txHash received');
        }
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
    [marketId, keypair, sendTx]
  );

  return {
    submit,
    error,
    loading,
    txHash,
  };
};
