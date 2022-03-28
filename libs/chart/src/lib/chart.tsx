import dynamic from 'next/dynamic';
import React, { forwardRef } from 'react';
import { ChartProps } from 'pennant';
import 'pennant/dist/style.css';

// TODO: Remove this once pennant can reference React
if (typeof window !== 'undefined') {
  window.React = React;
}

const AsyncChart = dynamic<ChartProps>(
  () => import('pennant').then((res) => res.Chart),
  { ssr: false }
);

export const Chart = forwardRef(({ dataSource, interval }: ChartProps, ref) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <AsyncChart
      dataSource={dataSource}
      interval={interval}
      options={{ chartType: 'candle', overlays: [], studies: [] }}
      onOptionsChanged={(options) => console.log(options)}
      // TODO: Use theme switcher hook to pass theme to chart
      // theme="light"
    />
  );
});

export default Chart;
