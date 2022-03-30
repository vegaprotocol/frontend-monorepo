import dynamic from 'next/dynamic';
import type { ChartProps } from 'pennant';
import 'pennant/dist/style.css';

export const TradingChart = dynamic<ChartProps>(
  () => import('pennant').then((mod) => mod.Chart),
  { ssr: false }
);
