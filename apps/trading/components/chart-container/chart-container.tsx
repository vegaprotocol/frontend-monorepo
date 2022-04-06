import { ButtonRadio } from './button-radio';
import { DepthChartContainer } from '@vegaprotocol/depth-chart';
import { TradingChartContainer } from '@vegaprotocol/chart';
import { useState } from 'react';

interface ChartContainerProps {
  marketId: string;
}

export const ChartContainer = ({ marketId }: ChartContainerProps) => {
  const [chartType, setChartType] = useState<'depth' | 'trading'>('depth');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ButtonRadio
        name="chart-type"
        options={[
          { text: 'Trading view', value: 'trading' },
          { text: 'Depth', value: 'depth' },
        ]}
        currentOption={chartType}
        onSelect={(value) => {
          setChartType(value as 'depth' | 'trading');
        }}
      />
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
