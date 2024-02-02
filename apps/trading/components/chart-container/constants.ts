import { Interval } from '@vegaprotocol/types';

export type SupportedInterval = typeof SUPPORTED_INTERVALS[number];

export const SUPPORTED_INTERVALS = [
  Interval.INTERVAL_I1M,
  Interval.INTERVAL_I5M,
  Interval.INTERVAL_I15M,
  Interval.INTERVAL_I1H,
  Interval.INTERVAL_I6H,
  Interval.INTERVAL_I1D,
] as const;
