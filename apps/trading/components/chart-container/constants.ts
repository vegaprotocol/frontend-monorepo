import { Interval } from '@vegaprotocol/types';

export type SupportedInterval = typeof SUPPORTED_INTERVALS[number];

export const SUPPORTED_INTERVALS = [
  Interval.INTERVAL_I1M,
  Interval.INTERVAL_I5M,
  Interval.INTERVAL_I15M,
  Interval.INTERVAL_I30M,
  Interval.INTERVAL_I1H,
  Interval.INTERVAL_I4H,
  Interval.INTERVAL_I6H,
  Interval.INTERVAL_I8H,
  Interval.INTERVAL_I12H,
  Interval.INTERVAL_I1D,
  Interval.INTERVAL_I7D,
] as const;
