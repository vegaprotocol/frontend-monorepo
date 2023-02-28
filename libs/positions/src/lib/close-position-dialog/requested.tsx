import { t } from '@vegaprotocol/i18n';
import type { ClosingOrder as IClosingOrder } from '../use-close-position';
import { useRequestClosePositionData } from '../use-request-close-position-data';
import { ActiveOrders, ClosingOrder } from './shared';

export const Requested = ({
  order,
  partyId,
}: {
  order?: IClosingOrder;
  partyId: string;
}) => {
  const { market, marketData, orders, loading } = useRequestClosePositionData(
    order?.marketId,
    partyId
  );

  if (loading || !market || !marketData || !orders) {
    return <div>{t('Loading...')}</div>;
  }

  if (!order) {
    return (
      <div className="text-vega-pink">
        {t('Could not create closing order')}
      </div>
    );
  }

  return (
    <>
      <h2 className="font-bold">{t('Position to be closed')}</h2>
      <ClosingOrder order={order} market={market} marketData={marketData} />
      <ActiveOrders market={market} orders={orders} />
    </>
  );
};
