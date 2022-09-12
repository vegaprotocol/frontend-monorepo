import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { OrderFieldsFragment } from './__generated__/Orders';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { determineId, toNanoSeconds } from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';
import { Schema } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

export interface Order {
  marketId: string;
  type: Schema.OrderType;
  size: string;
  side: Schema.Side;
  timeInForce: Schema.OrderTimeInForce;
  price?: string;
  expiresAt?: Date;
}

export const getOrderDialogTitle = (
  status?: Schema.OrderStatus
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_ACTIVE:
      return t('Order submitted');
    case Schema.OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case Schema.OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case Schema.OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case Schema.OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case Schema.OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case Schema.OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Submission failed');
  }
};

export const getOrderDialogIntent = (
  status?: Schema.OrderStatus
): Intent | undefined => {
  if (!status) {
    return;
  }
  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return Intent.Warning;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return Intent.Danger;
    case Schema.OrderStatus.STATUS_FILLED:
    case Schema.OrderStatus.STATUS_ACTIVE:
      return Intent.Success;
    default:
      return;
  }
};

export const getOrderDialogIcon = (
  status?: Schema.OrderStatus
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
      return <Icon name="warning-sign" size={16} />;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return <Icon name="error" size={16} />;
    default:
      return;
  }
};

export const useOrderSubmit = () => {
  const { keypair } = useVegaWallet();
  const waitForOrderEvent = useOrderEvent();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderFieldsFragment | null>(null);

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
            ...order,
            price:
              order.type === Schema.OrderType.TYPE_LIMIT && order.price
                ? order.price
                : undefined,
            expiresAt: order.expiresAt
              ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
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
    [keypair, send, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    finalizedOrder,
    Dialog,
    submit,
    reset,
  };
};
