import { Intent, Notification, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import get from 'lodash/get';

import { useMarketsStore } from '@/stores/markets-store';

export const locators = {
  cancellationNotification: 'cancellation-notification',
};

const AllOrdersInMarketNotification = ({ marketId }: { marketId: string }) => {
  const { getMarketById, loading } = useMarketsStore((state) => ({
    getMarketById: state.getMarketById,
    loading: state.loading,
  }));
  if (loading) return null;
  const market = getMarketById(marketId);
  return (
    <Notification
      intent={Intent.Warning}
      message={`Cancel ALL open orders in ${
        get(market, 'tradableInstrument.instrument.code') ??
        truncateMiddle(marketId)
      }`}
    />
  );
};

export const CancellationNotification = ({
  orderId,
  marketId,
}: {
  orderId: string;
  marketId: string;
}) => {
  if (orderId) return null;

  return (
    <div className="mt-2" data-testid={locators.cancellationNotification}>
      {marketId ? (
        <AllOrdersInMarketNotification marketId={marketId} />
      ) : (
        <Notification
          intent={Intent.Warning}
          message={'Cancel ALL orders in ALL markets'}
        />
      )}
    </div>
  );
};
