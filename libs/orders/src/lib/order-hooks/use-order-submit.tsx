import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { OrderEvent_busEvents_event_Order } from './__generated__/OrderEvent';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { toNanoSeconds } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, determineId } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';
import { OrderTimeInForce } from '@vegaprotocol/types';
import { OrderType, OrderStatus } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

export const getOrderDialogTitle = (
  status?: OrderStatus
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_ACTIVE:
      return t('Order submitted');
    case OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Submission failed');
  }
};

export const getOrderDialogIntent = (
  status?: OrderStatus
): Intent | undefined => {
  if (!status) {
    return;
  }
  switch (status) {
    case OrderStatus.STATUS_PARKED:
    case OrderStatus.STATUS_EXPIRED:
    case OrderStatus.STATUS_PARTIALLY_FILLED:
      return Intent.Warning;
    case OrderStatus.STATUS_REJECTED:
    case OrderStatus.STATUS_STOPPED:
    case OrderStatus.STATUS_CANCELLED:
      return Intent.Danger;
    case OrderStatus.STATUS_FILLED:
    case OrderStatus.STATUS_ACTIVE:
      return Intent.Success;
    default:
      return;
  }
};

export const getOrderDialogIcon = (
  status?: OrderStatus
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_PARKED:
    case OrderStatus.STATUS_EXPIRED:
      return <Icon name="warning-sign" size={16} />;
    case OrderStatus.STATUS_REJECTED:
    case OrderStatus.STATUS_STOPPED:
    case OrderStatus.STATUS_CANCELLED:
      return <Icon name="error" size={16} />;
    default:
      return;
  }
};

export const useOrderSubmit = () => {
  const { pubKey } = useVegaWallet();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderEvent = useOrderEvent(transaction);

  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
  }, [resetTransaction]);

  const submit = useCallback(
    async (order: OrderSubmissionBody['orderSubmission']) => {
      if (!pubKey || !order.side) {
        return;
      }

      setFinalizedOrder(null);

      try {
        const res = await send(pubKey, {
          orderSubmission: {
            ...order,
            price:
              order.type === OrderType.TYPE_LIMIT && order.price
                ? order.price
                : undefined,
            expiresAt:
              order.expiresAt &&
              order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
                ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
                : undefined,
          },
        });

        if (res) {
          const orderId = determineId(res.signature);
          if (orderId) {
            waitForOrderEvent(orderId, pubKey, (order) => {
              setFinalizedOrder(order);
              setComplete();
            });
          }
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    },
    [pubKey, send, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    finalizedOrder,
    Dialog,
    submit,
    reset,
  };
};
