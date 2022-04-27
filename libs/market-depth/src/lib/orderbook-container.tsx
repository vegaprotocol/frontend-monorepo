import { useState } from 'react';
import { OrderbookManager } from './orderbook-manager';
import { Button } from '@vegaprotocol/ui-toolkit';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const [resolution, setResolution] = useState(1);

  return (
    <>
      <div className="flex gap-8">
        <Button
          data-testid="order-book-zoom-out"
          variant="secondary"
          onClick={() => setResolution(resolution * 10)}
          appendIconName="minus"
          className="flex-1"
        >
          Zoom out
        </Button>
        <Button
          data-testid="order-book-zoom-in"
          variant="secondary"
          onClick={() => setResolution(Math.max(resolution / 10, 1))}
          appendIconName="plus"
          className="flex-1"
        >
          Zoom in
        </Button>
      </div>
      <OrderbookManager resolution={resolution} marketId={marketId} />
    </>
  );
};
