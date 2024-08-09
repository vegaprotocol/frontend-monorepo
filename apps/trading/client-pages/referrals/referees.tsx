import { useLayoutEffect, useRef, useState } from 'react';
import { ns, useT } from '../../lib/use-t';
import { cn } from '@vegaprotocol/utils';
import {
  Loader,
  TextChildrenTooltip as Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { Table } from '../../components/table';
import { formatNumber, getDateTimeFormat } from '@vegaprotocol/utils';
import sortBy from 'lodash/sortBy';
import { Trans } from 'react-i18next';
import { QUSDTooltip } from './qusd-tooltip';
import { type Referee, useReferees } from './hooks/use-referees';
import { DEFAULT_AGGREGATION_DAYS } from './constants';

export const Referees = ({
  setId,
  aggregationEpochs,
}: {
  setId: string;
  aggregationEpochs: number;
}) => {
  const { data, loading } = useReferees(setId, aggregationEpochs, {
    // get total referree generated rewards for the last 30 days
    aggregationEpochs: DEFAULT_AGGREGATION_DAYS,
    properties: ['totalRefereeGeneratedRewards'],
  });

  if (loading) {
    return <Loader size="small" />;
  }

  return <RefereesTable data={data} aggregationEpochs={aggregationEpochs} />;
};

export const RefereesTable = ({
  data: referees,
  aggregationEpochs,
}: {
  data: Referee[];
  aggregationEpochs: number;
}) => {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    if ((tableRef.current?.getBoundingClientRect().height || 0) > 384) {
      setCollapsed(true);
    }
  }, []);
  return (
    <>
      {/* Referees (only for referrer view) */}
      {referees.length > 0 && (
        <div>
          <h2 className="mb-5 text-2xl">{t('Referees')}</h2>
          <div
            className={cn(
              collapsed && [
                'relative max-h-96 overflow-hidden',
                'after:w-full after:h-20 after:absolute after:bottom-0 after:left-0',
                'after:bg-gradient-to-t after:from-white after:to-transparent',
              ]
            )}
          >
            <button
              className={cn(
                'absolute left-1/2 bottom-0 z-10 p-2 translate-x-[-50%]',
                {
                  hidden: !collapsed,
                }
              )}
              onClick={() => setCollapsed(false)}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={24} />
            </button>
            <Table
              ref={tableRef}
              columns={[
                { name: 'party', displayName: t('Trader') },
                { name: 'joined', displayName: t('Date Joined') },
                {
                  name: 'volume',
                  displayName: t(
                    'volumeLastEpochs',
                    'Volume (last {{count}} epochs)',
                    {
                      count: aggregationEpochs,
                    }
                  ),
                },
                {
                  // NOTE: This should be gotten for the last 30 days regardless of the program's window length
                  name: 'commission',
                  displayName: (
                    <Trans
                      i18nKey="referralStatisticsCommission"
                      defaults="Commission earned in <0>qUSD</0> (<1>last {{count}} epochs</1>)"
                      components={[
                        <QUSDTooltip key="0" />,
                        <Tooltip
                          key="1"
                          description={t(
                            'Depending on data node retention you may not be able see the full 30 days'
                          )}
                        >
                          last 30 epochs
                        </Tooltip>,
                      ]}
                      values={{
                        count: DEFAULT_AGGREGATION_DAYS,
                      }}
                      ns={ns}
                    />
                  ),
                },
              ]}
              data={sortBy(
                referees.map((r) => ({
                  party: (
                    <span title={r.refereeId}>
                      {truncateMiddle(r.refereeId)}
                    </span>
                  ),
                  joined: getDateTimeFormat().format(new Date(r.joinedAt)),
                  volume: Number(r.totalRefereeNotionalTakerVolume),
                  commission: Number(r.totalRefereeGeneratedRewards),
                })),
                (r) => r.volume
              )
                .map((r) => ({
                  ...r,
                  volume: formatNumber(r.volume, 0),
                  commission: formatNumber(r.commission, 0),
                }))
                .reverse()}
            />
          </div>
        </div>
      )}
    </>
  );
};
