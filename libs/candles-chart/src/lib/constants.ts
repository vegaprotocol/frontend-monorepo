import { Interval as PennantInterval } from 'pennant';
import { Interval } from '@vegaprotocol/types';

export const PENNANT_INTERVAL_MAP = {
  [Interval.INTERVAL_BLOCK]: undefined, // TODO: handle block tick
  [Interval.INTERVAL_I1M]: PennantInterval.I1M,
  [Interval.INTERVAL_I5M]: PennantInterval.I5M,
  [Interval.INTERVAL_I15M]: PennantInterval.I15M,
  [Interval.INTERVAL_I30M]: PennantInterval.I30M,
  [Interval.INTERVAL_I1H]: PennantInterval.I1H,
  [Interval.INTERVAL_I4H]: PennantInterval.I4H,
  [Interval.INTERVAL_I6H]: PennantInterval.I6H,
  [Interval.INTERVAL_I8H]: PennantInterval.I8H,
  [Interval.INTERVAL_I12H]: PennantInterval.I12H,
  [Interval.INTERVAL_I1D]: PennantInterval.I1D,
  [Interval.INTERVAL_I7D]: PennantInterval.I7D,
} as const;
