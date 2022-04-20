import { useState } from 'react';
import { OrderbookManager } from './orderbook-manager';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';

export const OrderbookContainer = ({ marketId }: { marketId: string }) => {
  const [resolution, setResolution] = useState<number>(100);

  return (
    <>
      <div className="flex gap-8">
        <Button
          variant="secondary"
          onClick={() => setResolution(resolution * 10)}
          appendIconName="minus"
          className="flex-1"
        >
          Zoom out
        </Button>
        <Button
          variant="secondary"
          onClick={() => setResolution(Math.max(resolution / 10, 1))}
          appendIconName="plus"
          className="flex-1"
        >
          Zoom in{' '}
        </Button>
      </div>
      <OrderbookManager resolution={resolution} marketId={marketId} />
    </>
  );
};
