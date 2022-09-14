import { Schema } from '@vegaprotocol/types';
import type { NetworkStatsQuery } from '../components/stats-manager/__generated__/Stats';

type NodeData = Pick<
  Schema.NodeData,
  'inactiveNodes' | 'stakedTotal' | 'totalNodes' | 'uptime' | 'validatingNodes'
>;
export type Stats = Omit<
  NodeData & NetworkStatsQuery['statistics'],
  '__typename'
>;

// eslint-disable-next-line
export type Value = any;
export type GoodThreshold = (...args: Value[]) => boolean;

export interface StatFields {
  title: string;
  goodThreshold?: GoodThreshold;
  // eslint-disable-next-line
  formatter?: (arg0: Value) => any;
  promoted?: boolean;
  value?: Value;
  description?: string;
}

export interface StructuredStats {
  promoted: StatFields[];
  table: StatFields[];
}
