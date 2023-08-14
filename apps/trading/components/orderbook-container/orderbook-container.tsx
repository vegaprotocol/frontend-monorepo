import { OrderbookManager } from '@vegaprotocol/market-depth';
import { ViewType, useSidebar } from '../sidebar';
import { useDealTicketFormValues } from '@vegaprotocol/deal-ticket';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const update = useDealTicketFormValues((state) => state.updateAll);
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={(values) => {
        update(marketId, values);
        setView({ type: ViewType.Order });
      }}
    />
  );
};
