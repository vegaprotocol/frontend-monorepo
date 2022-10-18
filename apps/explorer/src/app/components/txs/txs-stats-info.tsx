import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { InfoBlock } from '../../components/info-block';
import type { TxsStats, TxsStats_statistics } from './__generated__/TxsStats';
import classNames from 'classnames';

const STATS_QUERY = gql`
  query TxsStats {
    statistics {
      averageOrdersPerBlock
      ordersPerSecond
      txPerBlock
      tradesPerSecond
    }
  }
`;

interface StatsMap {
  field: keyof TxsStats_statistics;
  label: string;
  info: string;
}

export const TXS_STATS_MAP: StatsMap[] = [
  {
    field: 'averageOrdersPerBlock',
    label: t('Orders per block'),
    info: t(
      'Number of new orders processed in the last block. All pegged orders and liquidity provisions count as a single order'
    ),
  },
  {
    field: 'txPerBlock',
    label: t('Transactions per block'),
    info: t('Number of transactions processed in the last block'),
  },
  {
    field: 'tradesPerSecond',
    label: t('Trades per second'),
    info: t('Number of trades processed in the last second'),
  },
  {
    field: 'ordersPerSecond',
    label: t('Order per second'),
    info: t(
      'Number of orders processed in the last second. All pegged orders and liquidity provisions count as a single order'
    ),
  },
];

interface TxsStatsInfoProps {
  className?: string;
}

export const TxsStatsInfo = ({ className }: TxsStatsInfoProps) => {
  const { data, startPolling, stopPolling } = useQuery<TxsStats>(STATS_QUERY);

  useEffect(() => {
    startPolling(1000);
    return () => stopPolling();
  });

  const gridStyles =
    'grid grid-rows-2 gap-4 grid-cols-2 xl:gap-8 xl:grid-rows-1 xl:grid-cols-4';
  const containerStyles = 'p-5 border rounded-lg border-zinc-500';

  return (
    <aside className={classNames(gridStyles, containerStyles, className)}>
      {TXS_STATS_MAP.map((field) => (
        <InfoBlock
          subtitle={field.label}
          tooltipInfo={field.info}
          title={data?.statistics[field.field] || ''}
        />
      ))}
    </aside>
  );
};
