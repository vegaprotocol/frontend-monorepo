import { OrderbookManager } from '@vegaprotocol/market-depth';
import { ViewType, useSidebar } from '../sidebar';
import { useDealTicketFormValues } from '@vegaprotocol/react-helpers';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { getQuoteName, useMarket } from '../../lib/hooks/use-markets';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const currentRouteId = useGetCurrentRouteId();
  const update = useDealTicketFormValues((state) => state.updateAll);
  const setViews = useSidebar((store) => store.setViews);
  const { data } = useMarket({ marketId });

  if (!data) return null;

  return (
    <OrderbookManager
      // @ts-ignore TODO: fix type error here
      market={data}
      quoteName={getQuoteName(data)}
      onClick={(values) => {
        update(marketId, values);
        setViews({ type: ViewType.Order }, currentRouteId);
      }}
    />
  );
};
