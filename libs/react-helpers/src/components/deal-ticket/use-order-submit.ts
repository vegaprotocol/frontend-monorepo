import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { SHA3 } from 'sha3';
import { Order } from '../../hooks/use-order-state';
import { useVegaWallet } from '../vega-wallet';

export enum Status {
  Default = 'Default',
  AwaitingConfirmation = 'AwaitingConfirmation',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export const useOrderSubmit = (marketId: string) => {
  const { keypair, sendTx } = useVegaWallet();
  const [status, setStatus] = useState(Status.Default);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [id, setId] = useState('');

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair) {
        throw new Error('No keypair provided');
      }

      if (!order.side) {
        throw new Error('No side provided');
      }

      try {
        setStatus(Status.AwaitingConfirmation);
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

        if (!res.tx?.signature?.value) {
          throw new Error('No signature received');
        }

        setTxHash(res.txHash);
        setId(determineId(res.tx?.signature?.value).toUpperCase());
        setStatus(Status.Pending);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus(Status.Rejected);
      } finally {
        setLoading(false);
      }
    },
    [marketId, keypair, sendTx]
  );

  return {
    submit,
    status,
    error,
    loading,
    txHash,
    id,
  };
};

export const determineId = (sig: string) => {
  // Prepend 0x
  if (sig.slice(0, 2) !== '0x') {
    sig = '0x' + sig;
  }

  // Create the ID
  const hash = new SHA3(256);
  const bytes = ethers.utils.arrayify(sig);
  hash.update(Buffer.from(bytes));
  const id = ethers.utils.hexlify(hash.digest());

  // Remove 0x as core doesn't keep them in the API
  return id.substring(2);
};
