import type { vegaOrder } from '@vegaprotocol/rest-clients/dist/trading-data';

import { OrderBadges } from '../../utils/order/badges';
import { OrderTable } from '../../utils/order-table';
import { CancellationNotification } from './cancellation-notification';

export const locators = {
  cancellationView: 'cancellation-view',
};

export const CancellationView = ({
  cancellation,
  order,
}: {
  cancellation: any;
  order?: vegaOrder | null;
}) => {
  const { orderId, marketId } = cancellation;

  return (
    <div data-testid={locators.cancellationView}>
      <OrderTable {...{ ...cancellation, ...order }} />
      <OrderBadges {...cancellation} />
      <CancellationNotification orderId={orderId} marketId={marketId} />
    </div>
  );
};
