import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  getTimeFormat,
  isValidDate,
  t,
} from '@vegaprotocol/react-helpers';
import type { Stats, StatFields } from './types';

// Stats fields config. Keys will correspond to graphql queries when used, and values
// contain the associated data and methods we need to render. A single query
// can be rendered in multiple ways (see 'upTime').
export const statsFields: { [key in keyof Stats]: StatFields[] } = {
  status: [
    {
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
      promoted: true,
      description: t(
        'Status is either connected, replaying, unspecified or disconnected'
      ),
    },
  ],
  blockHeight: [
    {
      title: t('Height'),
      goodThreshold: (height: number) => height >= 60,
      promoted: true,
      description: t('Block height'),
    },
  ],
  totalNodes: [
    {
      title: t('Total nodes'),
      description: t('The total number of nodes registered on the network'),
    },
  ],
  inactiveNodes: [
    {
      title: t('Inactive nodes'),
      goodThreshold: (totalInactive: number) => totalInactive < 1,
      description: t('Nodes that are registered but not validating'),
    },
  ],
  stakedTotal: [
    {
      title: t('Total staked'),
      formatter: (total: string) => {
        return addDecimalsFormatNumber(total, 18, 2);
      },
      description: t('Sum of VEGA associated with a Vega key'),
    },
  ],
  backlogLength: [
    {
      title: t('Backlog'),
      goodThreshold: (length: number, blockDuration: number) => {
        return (
          length < 1000 || (length >= 1000 && blockDuration / 1000000000 <= 1)
        );
      },
      description: t('Number of transactions waiting to be processed'),
    },
  ],
  tradesPerSecond: [
    {
      title: t('Trades / second'),
      goodThreshold: (trades: number) => trades >= 2,
      description: t('Number of trades processed in the last second'),
    },
  ],
  averageOrdersPerBlock: [
    {
      title: t('Orders / block'),
      goodThreshold: (orders: number) => orders >= 2,
      description: t(
        'Number of new orders processed in the last block. All pegged orders and liquidity provisions count as a single order'
      ),
    },
  ],
  ordersPerSecond: [
    {
      title: t('Orders / second'),
      goodThreshold: (orders: number) => orders >= 2,
      description: t(
        'Number of orders processed in the last second. All pegged orders and liquidity provisions count as a single order'
      ),
    },
  ],
  txPerBlock: [
    {
      title: t('Transactions / block'),
      goodThreshold: (tx: number) => tx > 2,
      description: t('Number of transactions processed in the last block'),
    },
  ],
  blockDuration: [
    {
      title: t('Block time'),
      formatter: (duration: string) => {
        if (duration?.includes('ms')) {
          return (parseFloat(duration) / 1000).toFixed(2).toString();
        } else if (duration?.includes('s')) {
          return parseFloat(duration).toFixed(2).toString();
        }
        return undefined;
      },
      goodThreshold: (blockDuration: string) =>
        blockDuration?.includes('ms') ||
        (blockDuration.includes('s') && parseFloat(blockDuration) <= 2),
      description: t('Seconds between the two most recent blocks'),
    },
  ],
  vegaTime: [
    {
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
    },
  ],
  appVersion: [
    {
      title: t('App'),
      description: t('Vega node software version on this node'),
    },
  ],
  chainVersion: [
    {
      title: t('Tendermint'),
      description: t('Tendermint software version on this node'),
    },
  ],
  genesisTime: [
    {
      title: t('Uptime'),
      formatter: (t: string) => {
        if (!t) {
          return;
        }
        const date = new Date(t);
        if (!isValidDate(date)) {
          return;
        }
        const secSinceStart = (new Date().getTime() - date.getTime()) / 1000;
        const days = Math.floor(secSinceStart / 60 / 60 / 24);
        const hours = Math.floor((secSinceStart / 60 / 60) % 24);
        const mins = Math.floor((secSinceStart / 60) % 60);
        const secs = Math.floor(secSinceStart % 60);
        return `${days}d ${hours}h ${mins}m ${secs}s`;
      },
      promoted: true,
      description: t('Time since genesis'),
    },
    {
      title: t('Up since'),
      formatter: (t: string) => {
        if (!t) {
          return;
        }
        const date = new Date(t);
        if (!isValidDate(date)) {
          return;
        }
        return getDateTimeFormat().format(date);
      },
      description: t('Genesis'),
    },
  ],
  chainId: [
    {
      title: t('Chain ID'),
      description: t('Identifier'),
    },
  ],
};
