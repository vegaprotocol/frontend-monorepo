import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { SHA3 } from 'sha3';
import { Order } from '../../hooks/use-order-state';
import { useVegaWallet } from '../vega-wallet';
import { useVegaTransaction } from './use-vega-transaction';

export const useOrderSubmit = (marketId: string) => {
  const { keypair } = useVegaWallet();
  const { send, status, setStatus, tx, error } = useVegaTransaction();
  const [id, setId] = useState('');

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair) {
        throw new Error('No keypair provided');
      }

      if (!order.side) {
        throw new Error('No side provided');
      }

      const res = await send({
        pubKey: keypair.pub,
        propagate: true,
        orderSubmission: {
          reference: '',
          marketId,
          price: order.price,
          size: order.size,
          type: 'invalid', // order.type,
          side: order.side,
          timeInForce: order.timeInForce,
          expiresAt: order.expiration
            ? // Wallet expects timestamp in nanoseconds, we don't have that level of accuracy so
              // just append 6 zeroes
              order.expiration.getTime().toString() + '000000'
            : undefined,
        },
      });

      if (res?.tx?.signature?.value) {
        setId(determineId(res.tx.signature.value).toUpperCase());
      }
    },
    [marketId, keypair, send]
  );

  return {
    submit,
    status,
    setStatus,
    error,
    txHash: tx?.txHash,
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
