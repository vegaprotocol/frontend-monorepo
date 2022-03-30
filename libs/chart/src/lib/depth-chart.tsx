import dynamic from 'next/dynamic';
import type { DepthChartProps } from 'pennant';
import 'pennant/dist/style.css';

export const DepthChart = dynamic<DepthChartProps>(
  () => import('pennant').then((mod) => mod.DepthChart),
  { ssr: false }
);
