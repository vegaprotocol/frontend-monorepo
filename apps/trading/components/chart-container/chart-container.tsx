import { ButtonRadio } from './button-radio';
import { DepthChartContainer } from '@vegaprotocol/depth-chart';
import { TradingChartContainer } from '@vegaprotocol/chart';
import { useState } from 'react';

type ChartType = 'depth' | 'trading';

interface ChartContainerProps {
  marketId: string;
}

export const ChartContainer = ({ marketId }: ChartContainerProps) => {
  const [chartType, setChartType] = useState<ChartType>('trading');

  return (
    <div className="px-4 py-8 flex flex-col h-full">
      <div className="mb-4">
        <ButtonRadio
          name="chart-type"
          options={[
            { text: 'Trading view', value: 'trading' },
            { text: 'Depth', value: 'depth' },
          ]}
          currentOption={chartType}
          onSelect={(value) => {
            setChartType(value);
          }}
        />
      </div>
      <div className="flex-1">
        {chartType === 'trading' ? (
          <TradingChartContainer marketId={marketId} />
        ) : (
          <DepthChartContainer marketId={marketId} />
        )}
      </div>
    </div>
  );
};
