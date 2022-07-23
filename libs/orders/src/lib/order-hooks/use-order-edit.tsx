import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useState, useCallback } from 'react';
import {
  useVegaTransaction,
  useVegaWallet,
  VegaWalletOrderTimeInForce,
} from '@vegaprotocol/wallet';
import type { OrderEvent_busEvents_event_Order } from './__generated__';
import * as Sentry from '@sentry/react';
import type { OrderFields } from '../components';
import { useOrderEvent } from './use-order-event';

// Can only edit price for now
export interface EditOrderArgs {
  price: string;
}

export const useOrderEdit = (order: OrderFields | null) => {
  const { keypair } = useVegaWallet();

  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderEvent = useOrderEvent();

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
  }, [resetTransaction]);

  const edit = useCallback(
    async (args: EditOrderArgs) => {
      if (!keypair || !order || !order.market) {
        return;
      }

      setUpdatedOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            // @ts-ignore fix me please!
            price: {
              value: removeDecimal(args.price, order.market.decimalPlaces),
            },
            timeInForce: VegaWalletOrderTimeInForce[order.timeInForce],
            // @ts-ignore fix me please!
            sizeDelta: 0,
            expiresAt: order.expiresAt
              ? {
                  value:
                    // Wallet expects timestamp in nanoseconds,
                    // we don't have that level of accuracy so just append 6 zeroes
                    new Date(order.expiresAt).getTime().toString() + '000000',
                }
              : undefined,
          },
        });

        if (res?.signature) {
          const resId = order.id ?? determineId(res.signature);
          setUpdatedOrder(null);

          if (resId) {
            // Start a subscription looking for the newly created order
            waitForOrderEvent(resId, keypair.pub, (order) => {
              setUpdatedOrder(order);
              setComplete();
            });
          }
        }
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send, order, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    updatedOrder,
    Dialog,
    edit,
    reset,
  };
};
