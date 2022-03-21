import { Stats as IStats, StatFields as IStatFields } from './types';

// Stats fields config. Keys will correspond to graphql queries when used, and values
// contain the associated data and methods we need to render. A single query
// can be rendered in multiple ways (see 'upTime').
export const statsFields: { [key in keyof IStats]: IStatFields[] } = {
  status: [
    {
      title: 'Status',
      formatter: (status: string) => {
        if (!status) {
          return;
        }

        const i = status.lastIndexOf('_');
        if (i === -1) {
          return status;
        } else {
          return status.substr(i + 1);
        }
      },
      goodThreshold: (status: string) =>
        status === 'CONNECTED' || status === 'CHAIN_STATUS_CONNECTED',
      promoted: true,
      description:
        'Status is either connected, replaying, unspecified or disconnected',
    },
  ],
  blockHeight: [
    {
      title: 'Height',
      goodThreshold: (height: number) => height >= 60,
      promoted: true,
      description: 'Block height',
    },
  ],
  totalNodes: [
    {
      title: 'Total nodes',
      description: 'The total number of nodes registered on the network',
    },
  ],
  validatingNodes: [
    {
      title: 'Validating nodes',
      promoted: true,
      description: 'Nodes participating in consensus',
    },
  ],
  inactiveNodes: [
    {
      title: 'Inactive nodes',
      goodThreshold: (totalInactive: number) => totalInactive < 1,
      description: 'Nodes that are registered but not validating',
    },
  ],
  stakedTotal: [
    {
      title: 'Total staked',
      formatter: (total: string) =>
        total.length > 18 &&
        parseInt(total.substring(0, total.length - 18)).toLocaleString('en-US'),
      description: 'Sum of VEGA associated with a Vega key',
    },
  ],
  backlogLength: [
    {
      title: 'Backlog',
      goodThreshold: (length: number, blockDuration: number) => {
        return (
          length < 1000 || (length >= 1000 && blockDuration / 1000000000 <= 1)
        );
      },
      description: 'Number of transactions waiting to be processed',
    },
  ],
  tradesPerSecond: [
    {
      title: 'Trades / second',
      goodThreshold: (trades: number) => trades >= 2,
      description: 'Number of trades processed in the last second',
    },
  ],
  averageOrdersPerBlock: [
    {
      title: 'Orders / block',
      goodThreshold: (orders: number) => orders >= 2,
      description:
        'Number of new orders processed in the last block. All pegged orders and liquidity provisions count as a single order',
    },
  ],
  ordersPerSecond: [
    {
      title: 'Orders / second',
      goodThreshold: (orders: number) => orders >= 2,
      description:
        'Number of orders processed in the last second. All pegged orders and liquidity provisions count as a single order',
    },
  ],
  txPerBlock: [
    {
      title: 'Transactions / block',
      goodThreshold: (tx: number) => tx > 2,
      description: 'Number of transactions processed in the last block',
    },
  ],
  blockDuration: [
    {
      title: 'Block time',
      formatter: (duration: number) => (duration / 1000000000).toFixed(3),
      goodThreshold: (blockDuration: number) =>
        blockDuration > 0 && blockDuration <= 2000000000,
      description: 'Seconds between the two most recent blocks',
    },
  ],
  vegaTime: [
    {
      title: 'Time',
      formatter: (time: Date) => new Date(time).toLocaleTimeString(),
      goodThreshold: (time: Date) => {
        let diff = new Date().getTime() - new Date(time).getTime();
        return diff > 0 && diff < 5000;
      },
      description: 'The time on the blockchain',
    },
  ],
  appVersion: [
    {
      title: 'App',
      description: 'Vega node software version on this node',
    },
  ],
  chainVersion: [
    {
      title: 'Tendermint',
      description: 'Tendermint software version on this node',
    },
  ],
  uptime: [
    {
      title: 'Uptime',
      formatter: (t: string) => {
        if (!t) {
          return;
        }
        const secSinceStart =
          (new Date().getTime() - new Date(t).getTime()) / 1000;
        const days = Math.floor(secSinceStart / 60 / 60 / 24);
        const hours = Math.floor((secSinceStart / 60 / 60) % 24);
        const mins = Math.floor((secSinceStart / 60) % 60);
        const secs = Math.floor(secSinceStart % 60);
        return `${days}d ${hours}h ${mins}m ${secs}s`;
      },
      promoted: true,
      description: 'Time since genesis',
    },
    {
      title: 'Up since',
      formatter: (t: string) => {
        if (!t) {
          return;
        }
        return `${new Date(t).toLocaleString().replace(',', ' ')}`;
      },
      description: 'Genesis',
    },
  ],
  chainId: [
    {
      title: 'Chain ID',
      description: 'Identifier',
    },
  ],
};
