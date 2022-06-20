import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import type { OrderCancellationBodyOrderCancellation } from '@vegaprotocol/vegawallet-service-api-client';

export const useOrderCancel = ({
  marketId,
  orderId,
}: OrderCancellationBodyOrderCancellation) => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [finalizedOrder, setFinalizedOrder] = useState<string | null>(null);

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
    if (res) setFinalizedOrder(orderId);
    return res;
  }, [keypair, marketId, orderId, send]);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
  }, [resetTransaction]);

  return {
    transaction,
    finalizedOrder,
    cancel,
    reset,
  };
};
