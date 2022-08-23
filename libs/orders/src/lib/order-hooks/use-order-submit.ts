import { useCallback, useState } from 'react';
import type { OrderEvent_busEvents_event_Order } from './__generated__';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  determineId,
  removeDecimal,
  toNanoSeconds,
} from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';
import type { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';

export interface Order {
  type: OrderType;
  size: string;
  side: Side;
  timeInForce: OrderTimeInForce;
  price?: string;
  expiration?: Date;
}

export interface Market {
  id: string;
  decimalPlaces: number;
  positionDecimalPlaces: number;
}

export const useOrderSubmit = (market: Market) => {
  const { keypair } = useVegaWallet();
  const waitForOrderEvent = useOrderEvent();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    TransactionDialog,
  } = useVegaTransaction();

  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
  }, [resetTransaction]);

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair || !order.side) {
        return;
      }

      setFinalizedOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderSubmission: {
            marketId: market.id,
            price:
              order.type === OrderType.TYPE_LIMIT && order.price
                ? removeDecimal(order.price, market.decimalPlaces)
                : undefined,
            size: removeDecimal(order.size, market.positionDecimalPlaces),
            type: order.type,
            side: order.side,
            timeInForce: order.timeInForce,
            expiresAt: order.expiration
              ? toNanoSeconds(order.expiration) // Wallet expects timestampe in nanoseconds
              : undefined,
          },
        });

        if (res?.signature) {
          const resId = determineId(res.signature);
          if (resId) {
            waitForOrderEvent(resId, keypair.pub, (order) => {
              setFinalizedOrder(order);
              setComplete();
            });
          }
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send, market, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    finalizedOrder,
    TransactionDialog,
    submit,
    reset,
  };
};
