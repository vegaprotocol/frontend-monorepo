import { OrderbookManager } from '@vegaprotocol/market-depth';
import { ViewType, useSidebar } from '../sidebar';
import { useDealTicketFormValues } from '@vegaprotocol/react-helpers';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const currentRouteId = useGetCurrentRouteId();
  const update = useDealTicketFormValues((state) => state.updateAll);
  const setViews = useSidebar((store) => store.setViews);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={(values) => {
        update(marketId, values);
        setViews({ type: ViewType.Order }, currentRouteId);
      }}
    />
  );
};
