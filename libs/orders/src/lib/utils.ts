import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import type { OrderSubFieldsFragment } from './order-hooks';
import { Intent } from '@vegaprotocol/ui-toolkit';

// More detail in https://docs.vega.xyz/mainnet/graphql/enums/order-time-in-force
export const timeInForceLabel = (tif: string) => {
  switch (tif) {
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GTC:
      return t(`Good 'til Cancelled (GTC)`);
    case Schema.OrderTimeInForce.TIME_IN_FORCE_IOC:
      return t('Immediate or Cancel (IOC)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_FOK:
      return t('Fill or Kill (FOK)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GTT:
      return t(`Good 'til Time (GTT)`);
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GFN:
      return t('Good for Normal (GFN)');
    case Schema.OrderTimeInForce.TIME_IN_FORCE_GFA:
      return t('Good for Auction (GFA)');
    default:
      return t(tif);
  }
};

export const getRejectionReason = (
  order: OrderSubFieldsFragment
): string | null => {
  switch (order.status) {
    case Schema.OrderStatus.STATUS_STOPPED:
      return t(
        `Your ${
          Schema.OrderTimeInForceMapping[order.timeInForce]
        } order was not filled and it has been stopped`
      );
    default:
      return order.rejectionReason
        ? t(Schema.OrderRejectionReasonMapping[order.rejectionReason])
        : null;
  }
};

export const getOrderToastTitle = (
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

export const getOrderToastIntent = (
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
      return Intent.Danger;
    case Schema.OrderStatus.STATUS_FILLED:
    case Schema.OrderStatus.STATUS_ACTIVE:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return Intent.Success;
    default:
      return;
  }
};
