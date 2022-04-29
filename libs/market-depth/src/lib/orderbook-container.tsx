import { OrderbookManager } from './orderbook-manager';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => (
  <OrderbookManager marketId={marketId} />
);
