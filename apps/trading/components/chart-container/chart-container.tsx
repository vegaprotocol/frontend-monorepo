import { DepthChartContainer } from '../depth-chart-container';
import { Market_market } from '@vegaprotocol/graphql';
import { TradingChartContainer } from '../trading-chart-container';
import { useState } from 'react';
import { ButtonRadio } from './button-radio';

interface ChartContainerProps {
  market: Market_market;
}

export const ChartContainer = ({ market }: ChartContainerProps) => {
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
      <div style={{ flex: '1 1 0' }}>
        {chartType === 'trading' ? (
          <TradingChartContainer marketId={market.id} />
        ) : (
          <DepthChartContainer marketId={market.id} />
        )}
      </div>
    </div>
  );
};
