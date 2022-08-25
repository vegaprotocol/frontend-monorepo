import type {
  NetworkStats_nodeData,
  NetworkStats_statistics,
} from '../components/stats-manager/__generated__/NetworkStats';

export type Stats = Omit<NetworkStats_nodeData, '__typename'> &
  Omit<NetworkStats_statistics, '__typename'>;

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
