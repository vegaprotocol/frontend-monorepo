import { removeDecimal, toNanoSeconds } from '@vegaprotocol/react-helpers';
import { useState, useCallback } from 'react';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderSubFieldsFragment } from './';
import * as Sentry from '@sentry/react';
import type { Order } from '../components';
import { useOrderUpdate } from './use-order-update';
import BigNumber from 'bignumber.js';

export interface EditOrderArgs {
  price: string;
  size?: string;
}

export const useOrderEdit = (order: Order | null) => {
  const { pubKey } = useVegaWallet();

  const [updatedOrder, setUpdatedOrder] =
    useState<OrderSubFieldsFragment | null>(null);

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderUpdate = useOrderUpdate(transaction);

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
  }, [resetTransaction]);

  const edit = useCallback(
    async (args: EditOrderArgs) => {
      if (!pubKey || !order || !order.market) {
        return;
      }

      setUpdatedOrder(null);

      try {
        await send(pubKey, {
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            price: removeDecimal(args.price, order.market.decimalPlaces),
            timeInForce: order.timeInForce,
            sizeDelta: args.size
              ? new BigNumber(
                  removeDecimal(args.size, order.market.positionDecimalPlaces)
                )
                  .minus(order.size)
                  .toNumber()
              : 0,
            expiresAt: order.expiresAt
              ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
              : undefined,
          },
        });

        const updatedOrder = await waitForOrderUpdate(order.id, pubKey);
        setUpdatedOrder(updatedOrder);
        setComplete();
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, order, setComplete, waitForOrderUpdate]
  );

  return {
    transaction,
    updatedOrder,
    Dialog,
    edit,
    reset,
  };
};
