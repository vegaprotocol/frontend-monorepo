import { useCallback, useState } from 'react';
import type { TransactionResult } from '@vegaprotocol/wallet';
import { determineId } from '@vegaprotocol/wallet';
import { useVegaWallet, useTransactionResult } from '@vegaprotocol/wallet';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { useOrderEvent } from '@vegaprotocol/orders';
import type { OrderEvent_busEvents_event_Order } from '@vegaprotocol/orders';

export interface ClosingOrder {
  marketId: string;
  type: OrderType.TYPE_MARKET;
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK;
  side: Side;
  size: string;
}

export const useClosePosition = () => {
  const { pubKey } = useVegaWallet();
  const { send, transaction, setComplete, Dialog } = useVegaTransaction();
  const [closingOrder, setClosingOrder] = useState<ClosingOrder>();
  const [closingOrderResult, setClosingOrderResult] =
    useState<OrderEvent_busEvents_event_Order>();
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();
  const waitForTransactionResult = useTransactionResult();
  const waitForOrder = useOrderEvent(transaction);

  const submit = useCallback(
    async ({
      marketId,
      openVolume,
    }: {
      marketId: string;
      openVolume: string;
    }) => {
      if (!pubKey || openVolume === '0') {
        return;
      }

      setTransactionResult(undefined);
      setClosingOrder(undefined);

      try {
        // figure out if opsition is long or short and make side the opposite
        const side = openVolume.startsWith('-')
          ? Side.SIDE_BUY
          : Side.SIDE_SELL;

        // volume could be prefixed with '-' if position is short, remove it
        const size = openVolume.replace('-', '');
        const closingOrder = {
          marketId: marketId,
          type: OrderType.TYPE_MARKET as const,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK as const,
          side,
          size,
        };

        setClosingOrder(closingOrder);

        const command = {
          batchMarketInstructions: {
            cancellations: [
              {
                marketId,
                orderId: '', // omit order id to cancel all active orders
              },
            ],
            submissions: [closingOrder],
          },
        };

        const res = await send(pubKey, command);

        if (res) {
          const orderId = determineId(res.signature);
          const [txResult, orderResult] = await Promise.all([
            waitForTransactionResult(res.transactionHash, pubKey),
            waitForOrder(orderId, pubKey),
          ]);
          setTransactionResult(txResult);
          setClosingOrderResult(orderResult);
          setComplete();
        }

        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, setComplete, waitForTransactionResult, waitForOrder]
  );

  return {
    transaction,
    transactionResult,
    submit,
    closingOrder,
    closingOrderResult,
    Dialog,
  };
};
