import { OrderbookManager } from '@vegaprotocol/market-depth';
import { ViewType, useSidebar } from '../sidebar';

import { ticketEventEmitter } from '../../lib/hooks/use-ticket-events';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const setView = useSidebar((store) => store.setView);
  return (
    <OrderbookManager
      marketId={marketId}
      onClick={(values) => {
        ticketEventEmitter.emit('update', values);
        setView(ViewType.Trade);
      }}
    />
  );
};
