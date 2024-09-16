import { Interval } from '@vegaprotocol/types';

export const ALLOWED_TRADINGVIEW_HOSTNAMES = [
  'localhost',
  'trade.neb.exchange',
];

export const CHARTING_LIBRARY_FILE = 'charting_library.standalone.js';

export const TRADINGVIEW_INTERVAL_MAP = {
  [Interval.INTERVAL_BLOCK]: undefined, // TODO: handle block tick
  [Interval.INTERVAL_I1M]: '1',
  [Interval.INTERVAL_I5M]: '5',
  [Interval.INTERVAL_I15M]: '15',
  [Interval.INTERVAL_I30M]: '30',
  [Interval.INTERVAL_I1H]: '60',
  [Interval.INTERVAL_I4H]: '240',
  [Interval.INTERVAL_I6H]: '360',
  [Interval.INTERVAL_I8H]: '480',
  [Interval.INTERVAL_I12H]: '720',
  [Interval.INTERVAL_I1D]: '1D',
  [Interval.INTERVAL_I7D]: '1W',
} as const;

export type ResolutionRecord = typeof TRADINGVIEW_INTERVAL_MAP;
export type ResolutionString = ResolutionRecord[keyof ResolutionRecord];
