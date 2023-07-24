import { OrderbookManager } from '@vegaprotocol/market-depth';
import { useCreateOrderStore } from '@vegaprotocol/orders';
import { ViewType, useSidebar } from '../sidebar';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const useOrderStoreRef = useCreateOrderStore();
  const updateOrder = useOrderStoreRef((store) => store.update);
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={({ price, size }) => {
        if (price) {
          updateOrder(marketId, { price });
        }
        if (size) {
          updateOrder(marketId, { size });
        }
        setView({ type: ViewType.Order });
      }}
    />
  );
};
