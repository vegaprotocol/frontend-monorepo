import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useMemo, useState } from 'react';
import { useOrderBookData } from './use-orderbook-data';

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
  const [resolution, setResolution] = useState(1);
  const variables = useMemo(() => ({ marketId }), [marketId]);

  const { orderbookData, loading, error, data } = useOrderBookData({
    variables,
    resolution,
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <Orderbook
        {...orderbookData}
        decimalPlaces={data?.decimalPlaces ?? 0}
        positionDecimalPlaces={data?.positionDecimalPlaces ?? 0}
        resolution={resolution}
        onResolutionChange={(resolution: number) => setResolution(resolution)}
      />
    </AsyncRenderer>
  );
};
