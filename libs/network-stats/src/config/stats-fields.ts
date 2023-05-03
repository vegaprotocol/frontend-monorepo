import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  getTimeFormat,
  isValidDate,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type * as Schema from '@vegaprotocol/types';
import type { StatsQuery } from '../components/stats-manager/__generated__/Stats';

export type NodeData = Pick<
  Schema.NodeData,
  'stakedTotal' | 'totalNodes' | 'inactiveNodes'
>;

export type Statistics = Omit<StatsQuery['statistics'], '__typename'>;

// eslint-disable-next-line
export type FieldValue = any;
export type GoodThreshold = (...args: FieldValue[]) => boolean;

export interface Stats {
  field: keyof NodeData | keyof Statistics | 'epoch';
  title: string;
  goodThreshold?: GoodThreshold;
  // eslint-disable-next-line
  formatter?: (arg0: FieldValue) => any;
  promoted?: boolean;
  value?: FieldValue;
  description?: string;
}

const STATUS: Stats = {
  field: 'status',
  title: t('Status'),
  formatter: (status: string) => {
    if (!status) {
      return;
    }

    const i = status.lastIndexOf('_');
    if (i === -1) {
      return status;
    } else {
      return status.substring(i + 1);
    }
  },
  goodThreshold: (status: string) =>
    status === 'CONNECTED' || status === 'CHAIN_STATUS_CONNECTED',
  description: t(
    'Status is either connected, replaying, unspecified or disconnected'
  ),
};

const BLOCK_HEIGHT: Stats = {
  field: 'blockHeight',
  title: t('Block height'),
  goodThreshold: (height: number) => height >= 60,
  description: t('Block height'),
};

const TOTAL_NODES: Stats = {
  field: 'totalNodes',
  title: t('Total nodes'),
  description: t('The total number of nodes registered on the network'),
};

const TOTAL_STAKED: Stats = {
  field: 'stakedTotal',
  title: t('Total staked'),
  formatter: (total: string) => {
    return addDecimalsFormatNumber(total, 18, 2);
  },
  description: t('Sum of VEGA associated with a Vega key'),
};

const BACKLOG_LENGTH: Stats = {
  field: 'backlogLength',
  title: t('Backlog'),
  goodThreshold: (length: number, blockDuration: number) => {
    return length < 1000 || (length >= 1000 && blockDuration / 1000000000 <= 1);
  },
  description: t('Number of transactions waiting to be processed'),
};

const TRADES_PER_SECOND: Stats = {
  field: 'tradesPerSecond',
  title: t('Trades / second'),
  goodThreshold: (trades: number) => trades >= 2,
  description: t('Number of trades processed in the last second'),
};

const AVERAGE_ORDERS_PER_BLOCK: Stats = {
  field: 'averageOrdersPerBlock',
  title: t('Orders / block'),
  goodThreshold: (orders: number) => orders >= 2,
  description: t(
    'Number of new orders processed in the last block. All pegged orders and liquidity provisions count as a single order'
  ),
};

const ORDERS_PER_SECOND: Stats = {
  field: 'ordersPerSecond',
  title: t('Orders / second'),
  goodThreshold: (orders: number) => orders >= 2,
  description: t(
    'Number of orders processed in the last second. All pegged orders and liquidity provisions count as a single order'
  ),
};

const TX_PER_BLOCK: Stats = {
  field: 'txPerBlock',
  title: t('Transactions / block'),
  goodThreshold: (tx: number) => tx > 2,
  description: t('Number of transactions processed in the last block'),
};

const BLOCK_DURATION: Stats = {
  field: 'blockDuration',
  title: t('Block time'),
  formatter: (duration: string) => {
    const dp = 3;
    if (duration?.includes('ms')) {
      return (parseFloat(duration) / 1000).toFixed(dp).toString();
    } else if (duration?.includes('s')) {
      return parseFloat(duration).toFixed(dp).toString();
    }
    return duration ? (Number(duration) / 1000000000).toFixed(dp) : undefined;
  },
  goodThreshold: (blockDuration: string) => {
    if (blockDuration?.includes('ms')) {
      // we only get ms from the api if duration is less than 1s, so this
      // automatically passes
      return true;
    } else if (blockDuration?.includes('s')) {
      return parseFloat(blockDuration) <= 2;
    } else {
      return Number(blockDuration) > 0 && Number(blockDuration) <= 2000000000;
    }
  },
  description: t('Seconds between the two most recent blocks'),
};

const VEGA_TIME: Stats = {
  field: 'vegaTime',
  title: t('Time'),
  formatter: (time: Date) => {
    if (!time) {
      return;
    }
    const date = new Date(time);
    if (!isValidDate(date)) {
      return;
    }
    return getTimeFormat().format(date);
  },
  goodThreshold: (time: Date) => {
    const diff = new Date().getTime() - new Date(time).getTime();
    return diff > 0 && diff < 5000;
  },
  description: t('The time on the blockchain'),
};

const EPOCH: Stats = {
  field: 'epoch',
  title: 'Epoch',
};

const APP_VERSION: Stats = {
  field: 'appVersion',
  title: t('App'),
  description: t('Vega node software version on this node'),
};
const CHAIN_VERSION: Stats = {
  field: 'chainVersion',
  title: t('Tendermint'),
  description: t('Tendermint software version on this node'),
};

const UPTIME: Stats = {
  field: 'genesisTime',
  title: t('Uptime'),
  formatter: (t: string) => {
    if (!t) {
      return '-';
    }
    const date = new Date(t);
    if (!isValidDate(date)) {
      return '-';
    }
    const secSinceStart = (new Date().getTime() - date.getTime()) / 1000;
    const days = Math.floor(secSinceStart / 60 / 60 / 24);
    const hours = Math.floor((secSinceStart / 60 / 60) % 24);
    const mins = Math.floor((secSinceStart / 60) % 60);
    const secs = Math.floor(secSinceStart % 60);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  },
  description: t('Time since genesis'),
};

const UP_SINCE: Stats = {
  field: 'genesisTime',
  title: t('Up since'),
  formatter: (t: string) => {
    if (!t) {
      return '-';
    }
    const date = new Date(t);
    if (!isValidDate(date)) {
      return '-';
    }
    return getDateTimeFormat().format(date) || '-';
  },
  description: t('Genesis'),
};

const CHAIN_ID: Stats = {
  field: 'chainId',
  title: t('Chain ID'),
  description: t('Identifier'),
};

export const fieldsDefinition: Stats[] = [
  STATUS,
  EPOCH,
  BLOCK_HEIGHT,
  UPTIME,
  TOTAL_NODES,
  TOTAL_STAKED,
  BACKLOG_LENGTH,
  TRADES_PER_SECOND,
  AVERAGE_ORDERS_PER_BLOCK,
  ORDERS_PER_SECOND,
  TX_PER_BLOCK,
  BLOCK_DURATION,
  VEGA_TIME,
  APP_VERSION,
  CHAIN_VERSION,
  UP_SINCE,
  CHAIN_ID,
];
