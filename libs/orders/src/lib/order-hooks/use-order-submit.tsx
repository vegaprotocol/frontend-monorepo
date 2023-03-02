import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { OrderSubFieldsFragment } from './__generated__/OrdersSubscription';
import {
  useVegaWallet,
  useVegaTransaction,
  determineId,
} from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { useOrderUpdate } from './use-order-update';
import * as Schema from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';

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
  const { pubKey } = useVegaWallet();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderUpdate = useOrderUpdate(transaction);

  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderSubFieldsFragment | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
  }, [resetTransaction]);

  const submit = useCallback(
    async (orderSubmission: OrderSubmissionBody['orderSubmission']) => {
      if (!pubKey || !orderSubmission.side) {
        return;
      }

      setFinalizedOrder(null);

      try {
        const res = await send(pubKey, { orderSubmission });

        if (res) {
          const orderId = determineId(res.signature);
          if (orderId) {
            const order = await waitForOrderUpdate(orderId, pubKey);
            setFinalizedOrder(order);
            setComplete();
          }
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    },
    [pubKey, send, setComplete, waitForOrderUpdate]
  );

  return {
    transaction,
    finalizedOrder,
    Dialog,
    submit,
    reset,
  };
};
