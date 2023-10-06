import { CodeTile, StatTile } from './tile';
import {
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';

import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ReferralData } from './hooks/use-referral';
import { useReferral } from './hooks/use-referral';
import { CreateCodeContainer } from './create-code-form';
import classNames from 'classnames';
import { Table } from './table';
import {
  addDecimalsFormatNumber,
  getDateFormat,
  getDateTimeFormat,
  getNumberFormat,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { useReferralSetStatsQuery } from './hooks/__generated__/ReferralSetStats';
import compact from 'lodash/compact';
import { useReferralProgram } from './hooks/use-referral-program';
import { useStakeAvailable } from './hooks/use-stake-available';
import minBy from 'lodash/minBy';
import sortBy from 'lodash/sortBy';
import { useLayoutEffect, useRef, useState } from 'react';

export const ReferralStatistics = () => {
  const { pubKey } = useVegaWallet();

  const { data: referee } = useReferral(pubKey, 'referee');
  const { data: referrer } = useReferral(pubKey, 'referrer');

  if (referee?.code) {
    return <Statistics data={referee} as="referee" />;
  }

  if (referrer?.code) {
    return <Statistics data={referrer} as="referrer" />;
  }

  return <CreateCodeContainer />;
};

const Statistics = ({
  data,
  as,
}: {
  data: ReferralData;
  as: 'referrer' | 'referee';
}) => {
  const { stakeAvailable } = useStakeAvailable();
  const { stakingTiers } = useReferralProgram();
  const { data: statsData } = useReferralSetStatsQuery({
    variables: {
      code: data.code,
      // epoch: 116632,
    },
    skip: !data?.code,
    fetchPolicy: 'cache-and-network',
  });

  const stats =
    statsData?.referralSetStats.edges &&
    compact(removePaginationWrapper(statsData.referralSetStats.edges));

  // console.table(stats);

  const baseCommissionValue =
    stats && stats.length > 0 ? Number(stats[0].rewardFactor) : 0;
  // const runningVolumeValue =
  //   stats && stats.length > 0
  //     ? Number(stats[0].referralSetRunningNotionalTakerVolume)
  //     : 0;
  const stakingTier =
    stakingTiers &&
    stakeAvailable &&
    minBy(
      stakingTiers.filter(
        (st) => BigInt(st.minimumStakedTokens) <= stakeAvailable
      ),
      (st) => BigInt(st.minimumStakedTokens)
    )?.tier;
  const numberOfTradersValue = data.referees.length;

  const referrerTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-3">
        <CodeTile code={data?.code} />
        <StatTile title="Base commission rate">
          {baseCommissionValue * 100}%
        </StatTile>
        <StatTile title="Created at">
          <span className="_text-2xl">
            {getDateFormat().format(new Date(data.createdAt))}
          </span>
        </StatTile>
      </div>

      <div className="grid grid-rows-1 gap-5 grid-cols-4">
        <StatTile
          title="Staking multiplier"
          description={`(${addDecimalsFormatNumber(
            stakeAvailable?.toString() || 0,
            18
          )} $VEGA staked)`}
        >
          {stakingTier || 'None'}
        </StatTile>
        <StatTile title="Final commission rate">
          {!stakingTier || isNaN(stakingTier)
            ? baseCommissionValue * 100
            : stakingTier * baseCommissionValue * 100}
          %
        </StatTile>
        <StatTile title="Number of traders">{numberOfTradersValue}</StatTile>

        <StatTile title="Running total commission" description="(Quantum)">
          ...
        </StatTile>
      </div>
    </>
  );

  const refereeTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-1">
        <CodeTile code={data?.code} />
      </div>
    </>
  );

  const [collapsed, setCollapsed] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    if ((tableRef.current?.getBoundingClientRect().height || 0) > 384) {
      setCollapsed(true);
    }
  }, []);

  return (
    <>
      {/* Stats tiles */}
      <div
        className={classNames('grid grid-cols-1 grid-rows-1 gap-5 mx-auto', {
          'md:w-1/2': as === 'referee',
          // 'md:w-': as === 'referrer',
        })}
      >
        {as === 'referrer' && referrerTiles}
        {as === 'referee' && refereeTiles}
      </div>

      {/* Referees (only for referrer view) */}
      {as === 'referrer' && (
        <div className="mt-20 mb-20">
          <h2 className="text-2xl mb-5">Referees</h2>
          <div
            className={classNames(
              collapsed && [
                'relative max-h-96 overflow-hidden',
                'after:w-full after:h-20 after:absolute after:bottom-0 after:left-0',
                'after:bg-gradient-to-t after:from-white after:dark:from-vega-cdark-900 after:to-transparent',
              ]
            )}
          >
            <button
              className={classNames(
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
                { name: 'party', displayName: 'Trader' },
                { name: 'joined', displayName: 'Date Joined' },
                { name: 'volume', displayName: 'Volume' },
              ]}
              data={sortBy(
                data.referees.map((r) => ({
                  party: <span>{truncateMiddle(r.refereeId)}</span>,
                  joined: getDateTimeFormat().format(new Date(r.joinedAt)),
                  volume:
                    Number(
                      stats?.find((s) => s.partyId === r.refereeId)
                        ?.epochNotionalTakerVolume
                    ) || 0,
                })),
                (r) => r.volume
              )
                .map((r) => ({
                  ...r,
                  volume: getNumberFormat(0).format(r.volume),
                }))
                .reverse()}
            />
          </div>
        </div>
      )}
    </>
  );
};
