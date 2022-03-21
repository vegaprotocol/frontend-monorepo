export interface Stats {
  blockHeight: string;
  totalNodes: string;
  validatingNodes: string;
  inactiveNodes: string;
  stakedTotal: string;
  backlogLength: string;
  tradesPerSecond: string;
  averageOrdersPerBlock: string;
  ordersPerSecond: string;
  txPerBlock: string;
  blockDuration: string;
  status: string;
  vegaTime: string;
  appVersion: string;
  chainVersion: string;
  uptime: string;
  chainId: string;
}

export type value = any;
export type goodThreshold = (...args: value[]) => boolean;

export interface StatFields {
  title: string;
  goodThreshold?: goodThreshold;
  formatter?: (arg0: value) => any;
  promoted?: boolean;
  value?: value;
  description?: string;
}

export interface StructuredStats {
  promoted: StatFields[];
  table: StatFields[];
}

export interface DarkModeState {
  darkMode: boolean;
  setDarkMode: (arg0: boolean) => void;
}
