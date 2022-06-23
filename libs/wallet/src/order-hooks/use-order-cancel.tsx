import { useCallback, useEffect, useState } from 'react';
import type { OrderCancellationBodyOrderCancellation } from '@vegaprotocol/vegawallet-service-api-client';
import { determineId } from '@vegaprotocol/react-helpers';
import type { Order } from '../order-dialog';
import { useVegaTransaction } from '../use-vega-transaction';
import { useVegaWallet } from '../use-vega-wallet';

export const useOrderCancel = ({
  marketId,
  orderId,
}: OrderCancellationBodyOrderCancellation) => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);
  const [id, setId] = useState('');

  useEffect(() => {
    if (finalizedOrder) {
      resetTransaction();
    }
  }, [finalizedOrder, resetTransaction]);

  const cancel = useCallback(async () => {
    if (!keypair) {
      return;
    }

    setFinalizedOrder(null);

    const res = await send({
      pubKey: keypair.pub,
      propagate: true,
      orderCancellation: {
        orderId,
        marketId,
      },
    });
    console.log(res);

    if (res?.signature) {
      setId(determineId(res.signature));
    }
    return res;
  }, [keypair, marketId, orderId, send]);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
    setId('');
  }, [resetTransaction]);

  return {
    transaction,
    finalizedOrder,
    id,
    cancel,
    reset,
  };
};
