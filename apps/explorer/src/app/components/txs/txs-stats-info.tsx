import { t } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { InfoBlock } from '../../components/info-block';
import { Panel } from '../../components/panel';
import { useExplorerStatsQuery } from './__generated__/Explorer-stats';
import type { ExplorerStatsFieldsFragment } from './__generated__/Explorer-stats';

interface StatsMap {
  field: keyof ExplorerStatsFieldsFragment;
  label: string;
  info: string;
}

export const TXS_STATS_MAP: StatsMap[] = [
  {
    field: 'averageOrdersPerBlock',
    label: t('Orders per block'),
    info: t(
      'Number of new orders processed in the last block. All orders derived from pegged orders and liquidity commitments count as a single order'
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
      'Number of orders processed in the last second. All orders  derived from pegged orders and liquidity commitments count as a single order'
    ),
  },
];

interface TxsStatsInfoProps {
  className?: string;
}

export const TxsStatsInfo = ({ className }: TxsStatsInfoProps) => {
  const { data, startPolling, stopPolling } = useExplorerStatsQuery();

  useEffect(() => {
    startPolling(1000);
    return () => stopPolling();
  });

  const gridStyles =
    'grid grid-rows-2 gap-4 grid-cols-2 xl:gap-8 xl:grid-rows-1 xl:grid-cols-4';

  return (
    <Panel className={className}>
      <section className={gridStyles}>
        {TXS_STATS_MAP.map((field) => {
          if (!data?.statistics) {
            return null;
          }

          // Workaround for awkward typing
          const title = data.statistics[field.field] || '';
          return (
            <InfoBlock
              subtitle={field.label}
              tooltipInfo={field.info}
              title={title}
            />
          );
        })}
      </section>
    </Panel>
  );
};
