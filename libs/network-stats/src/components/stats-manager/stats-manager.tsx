import { useEffect } from 'react';
import classnames from 'classnames';
import { useEnvironment } from '@vegaprotocol/environment';
import { statsFields } from '../../config/stats-fields';
import type {
  Stats as IStats,
  StructuredStats as IStructuredStats,
} from '../../config/types';
import { Table } from '../table';
import { TableRow } from '../table-row';
import { PromotedStats } from '../promoted-stats';
import { PromotedStatsItem } from '../promoted-stats-item';
import { useStatsQuery } from './__generated__/Stats';
import type { StatsQuery } from './__generated__/Stats';

interface StatsManagerProps {
  className?: string;
}

const compileData = (data?: StatsQuery) => {
  const { nodeData, statistics } = data || {};
  const returned = { ...nodeData, ...statistics };

  // Loop through the stats fields config, grabbing values from the fetched
  // data and building a set of promoted and standard table entries.
  return Object.entries(statsFields).reduce(
    (acc, [key, value]) => {
      const statKey = key as keyof IStats;
      const statData = returned[statKey];

      value.forEach((x) => {
        const stat = {
          ...x,
          value: statData || '-',
        };

        stat.promoted ? acc.promoted.push(stat) : acc.table.push(stat);
      });

      return acc;
    },
    { promoted: [], table: [] } as IStructuredStats
  );
};

export const StatsManager = ({ className }: StatsManagerProps) => {
  const { VEGA_ENV } = useEnvironment();
  const { data, error, startPolling, stopPolling } = useStatsQuery();

  useEffect(() => {
    startPolling(1000);
    return () => stopPolling();
  });

  const displayData = compileData(data);

  const classes = classnames(
    className,
    'stats-grid w-full self-start justify-self-center'
  );

  return (
    <div className={classes}>
      <h3
        data-testid="stats-environment"
        className="font-alpha uppercase text-2xl pb-8 col-span-full"
      >
        {(error && `/ ${error}`) ||
          (data ? `/ ${VEGA_ENV}` : '/ Connecting...')}
      </h3>

      {displayData?.promoted ? (
        <PromotedStats>
          {displayData.promoted.map((stat, i) => {
            return (
              <PromotedStatsItem
                title={stat.title}
                value={stat.value || '-'}
                formatter={stat.formatter}
                goodThreshold={stat.goodThreshold}
                description={stat.description}
                key={i}
              />
            );
          })}
        </PromotedStats>
      ) : null}

      <Table>
        {displayData?.table
          ? displayData.table.map((stat, i) => {
              return (
                <TableRow
                  title={stat.title}
                  value={stat.value || '-'}
                  formatter={stat.formatter}
                  goodThreshold={stat.goodThreshold}
                  description={stat.description}
                  key={i}
                />
              );
            })
          : null}
      </Table>
    </div>
  );
};
