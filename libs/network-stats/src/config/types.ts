import type { NetworkStatsQuery } from '../components/stats-manager/__generated__/Stats';

export type Stats = Omit<NetworkStatsQuery['nodeData'], '__typename'> &
  Omit<NetworkStatsQuery['statistics'], '__typename'>;

// eslint-disable-next-line
export type value = any;
export type goodThreshold = (...args: value[]) => boolean;

export interface StatFields {
  title: string;
  goodThreshold?: goodThreshold;
  // eslint-disable-next-line
  formatter?: (arg0: value) => any;
  promoted?: boolean;
  value?: value;
  description?: string;
}

export interface StructuredStats {
  promoted: StatFields[];
  table: StatFields[];
}
