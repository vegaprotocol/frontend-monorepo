import { useState } from 'react';
import { OrderbookManager } from './orderbook-manager';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const [resolution] = useState<number>(50);

  return <OrderbookManager resolution={resolution} marketId={marketId} />;
};
