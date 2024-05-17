import { OrderbookManager } from '@vegaprotocol/market-depth';
import { useSidebar } from '../sidebar';
import { useDealTicketFormValues } from '@vegaprotocol/react-helpers';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const update = useDealTicketFormValues((state) => state.updateAll);
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={(values) => {
        update(marketId, values);
        setView('trade');
      }}
    />
  );
};
