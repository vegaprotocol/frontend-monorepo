import { Interval } from '@vegaprotocol/graphql';
import dynamic from 'next/dynamic';
import { forwardRef, useRef } from 'react';
import { Chart as PennantChart } from 'pennant';

// const AsyncChart = dynamic<{
//   dataSource: any;
//   interval: Interval;
//   options: any;
//   ref: any;
//   onOptionsChanged: (options: any) => void;
// }>(
//   // @ts-ignore asdf asdf asdf
//   import('pennant'),
//   { ssr: false }
// );

export interface ChartProps {
  dataSource: any;
}

export const Chart = forwardRef(({ dataSource }: ChartProps, ref) => {
  // @ts-ignore Prvent SSR of chart
  if (!process.browser) {
    return null;
  }

  return (
    <PennantChart
      dataSource={dataSource}
      interval={Interval.I15M}
      options={{ chartType: 'candle', overlays: [], studies: [] }}
      onOptionsChanged={(options) => console.log(options)}
    />
  );
});

export default Chart;
