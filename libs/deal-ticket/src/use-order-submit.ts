import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { SHA3 } from 'sha3';
import { Order } from './use-order-state';
import { OrderType, useVegaWallet } from '@vegaprotocol/wallet';
import { useVegaTransaction } from './use-vega-transaction';

export const useOrderSubmit = (marketId: string) => {
  const { keypair } = useVegaWallet();
  const { send, status, setStatus, tx, error } = useVegaTransaction();
  const [id, setId] = useState('');

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair || !order.side) {
        return;
      }

      const res = await send({
        pubKey: keypair.pub,
        propagate: true,
        orderSubmission: {
          marketId,
          price: order.type === OrderType.Market ? undefined : order.price,
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

      if (res?.signature) {
        setId(determineId(res.signature).toUpperCase());
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

/**
 * This function creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
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
