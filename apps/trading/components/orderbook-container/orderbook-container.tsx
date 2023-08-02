import { OrderbookManager } from '@vegaprotocol/market-depth';
import { useCreateOrderStore } from '@vegaprotocol/orders';
import { ViewType, useSidebar } from '../sidebar';
import { useStopOrderFormValues } from '@vegaprotocol/deal-ticket';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const useOrderStoreRef = useCreateOrderStore();
  const updateOrder = useOrderStoreRef((store) => store.update);
  const updateStoredFormValues = useStopOrderFormValues(
    (state) => state.update
  );
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={({ price, size }) => {
        if (price) {
          updateOrder(marketId, { price });
          updateStoredFormValues(marketId, { price });
        }
        if (size) {
          updateOrder(marketId, { size });
          updateStoredFormValues(marketId, { size });
        }
        setView({ type: ViewType.Order });
      }}
    />
  );
};
