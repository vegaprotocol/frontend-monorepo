import { OrderbookManager } from '@vegaprotocol/market-depth';
import { ViewType, useSidebar } from '../../lib/hooks/use-sidebar';

import { ticketEventEmitter } from '../../lib/ticket-event-emitter';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={(values) => {
        ticketEventEmitter.update(values);
        setView(ViewType.Trade);
      }}
    />
  );
};
