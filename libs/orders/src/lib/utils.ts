import { t } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { OrderSubFieldsFragment } from './order-hooks';

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
