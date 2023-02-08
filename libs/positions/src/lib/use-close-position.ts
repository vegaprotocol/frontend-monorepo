import { useCallback, useState } from 'react';
import type { TransactionResult } from '@vegaprotocol/wallet';
import { determineId } from '@vegaprotocol/wallet';
import { useVegaWallet, useTransactionResult } from '@vegaprotocol/wallet';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import * as Schema from '@vegaprotocol/types';
import { useOrderUpdate } from '@vegaprotocol/orders';
import type { OrderSubFieldsFragment } from '@vegaprotocol/orders';

export interface ClosingOrder {
  marketId: string;
  type: Schema.OrderType.TYPE_MARKET;
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK;
  side: Schema.Side;
  size: string;
}

export const useClosePosition = () => {
  const { pubKey } = useVegaWallet();
  const { send, transaction, setComplete, Dialog } = useVegaTransaction();
  const [closingOrder, setClosingOrder] = useState<ClosingOrder>();
  const [closingOrderResult, setClosingOrderResult] =
    useState<OrderSubFieldsFragment>();
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();
  const waitForTransactionResult = useTransactionResult();
  const waitForOrder = useOrderUpdate(transaction);

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
        // figure out if position is long or short and make side the opposite
        const side = openVolume.startsWith('-')
          ? Schema.Side.SIDE_BUY
          : Schema.Side.SIDE_SELL;

        // volume could be prefixed with '-' if position is short, remove it
        const size = openVolume.replace('-', '');
        const closingOrder = {
          marketId: marketId,
          type: Schema.OrderType.TYPE_MARKET as const,
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK as const,
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
