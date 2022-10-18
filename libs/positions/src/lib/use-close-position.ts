import { useCallback, useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { usePositionEvent } from '../';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';

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
  const waitForTransactionResult = usePositionEvent();

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
          await waitForTransactionResult(res?.transactionHash, pubKey);
          setComplete();
        }

        return res;
      } catch (e) {
        console.log(e);
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, setComplete, waitForTransactionResult]
  );

  return {
    transaction,
    submit,
    closingOrder,
    Dialog,
  };
};
