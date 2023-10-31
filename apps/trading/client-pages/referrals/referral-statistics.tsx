import { CodeTile, StatTile } from './tile';
import {
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

import { useVegaWallet } from '@vegaprotocol/wallet';
import { DEFAULT_AGGREGATION_DAYS, useReferral } from './hooks/use-referral';
import { CreateCodeContainer } from './create-code-form';
import classNames from 'classnames';
import { Table } from './table';
import {
  addDecimalsFormatNumber,
  getDateFormat,
  getDateTimeFormat,
  getNumberFormat,
  getUserLocale,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { useReferralSetStatsQuery } from './hooks/__generated__/ReferralSetStats';
import compact from 'lodash/compact';
import { useReferralProgram } from './hooks/use-referral-program';
import { useStakeAvailable } from './hooks/use-stake-available';
import sortBy from 'lodash/sortBy';
import { useLayoutEffect, useRef, useState } from 'react';
import { useCurrentEpochInfoQuery } from './hooks/__generated__/Epoch';
import BigNumber from 'bignumber.js';
import { t } from '@vegaprotocol/i18n';
import maxBy from 'lodash/maxBy';
import { DocsLinks } from '@vegaprotocol/environment';

export const ReferralStatistics = () => {
  const { pubKey } = useVegaWallet();

  const program = useReferralProgram();

  const { data: referee } = useReferral({
    pubKey,
    role: 'referee',
    aggregationEpochs: program.details?.windowLength,
  });
  const { data: referrer } = useReferral({
    pubKey,
    role: 'referrer',
    aggregationEpochs: program.details?.windowLength,
  });

  if (referee?.code) {
    return <Statistics data={referee} program={program} as="referee" />;
  }

  if (referrer?.code) {
    return <Statistics data={referrer} program={program} as="referrer" />;
  }

  return <CreateCodeContainer />;
};

export const Statistics = ({
  data,
  program,
  as,
}: {
  data: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
  as: 'referrer' | 'referee';
}) => {
  const { benefitTiers, details } = program;
  const { data: epochData } = useCurrentEpochInfoQuery();
  const { stakeAvailable } = useStakeAvailable();
  const { data: statsData } = useReferralSetStatsQuery({
    variables: {
      code: data.code,
    },
    skip: !data?.code,
    fetchPolicy: 'cache-and-network',
  });

  const currentEpoch = Number(epochData?.epoch.id);

  const compactNumFormat = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short',
  });

  const stats =
    statsData?.referralSetStats.edges &&
    compact(removePaginationWrapper(statsData.referralSetStats.edges));
  const refereeInfo = data.referee;
  const refereeStats = stats?.find(
    (r) => r.partyId === data.referee?.refereeId
  );

  const statsAvailable = stats && stats.length > 0 && stats[0];
  const baseCommissionValue = statsAvailable
    ? Number(statsAvailable.rewardFactor)
    : 0;
  const runningVolumeValue = statsAvailable
    ? Number(statsAvailable.referralSetRunningNotionalTakerVolume)
    : 0;
  const referrerVolumeValue = statsAvailable
    ? Number(statsAvailable.referrerTakerVolume)
    : 0;
  const multiplier = statsAvailable
    ? Number(statsAvailable.rewardsMultiplier)
    : 1;
  const finalCommissionValue = isNaN(multiplier)
    ? baseCommissionValue
    : multiplier * baseCommissionValue;

  const discountFactorValue = refereeStats?.discountFactor
    ? Number(refereeStats.discountFactor)
    : 0;
  const currentBenefitTierValue = benefitTiers.find(
    (t) =>
      !isNaN(discountFactorValue) &&
      !isNaN(t.discountFactor) &&
      t.discountFactor === discountFactorValue
  );
  const nextBenefitTierValue = currentBenefitTierValue
    ? benefitTiers.find((t) => t.tier === currentBenefitTierValue.tier - 1)
    : maxBy(benefitTiers, (bt) => bt.tier); // max tier number is lowest tier
  const epochsValue =
    !isNaN(currentEpoch) && refereeInfo?.atEpoch
      ? currentEpoch - refereeInfo?.atEpoch
      : 0;
  const nextBenefitTierVolumeValue = nextBenefitTierValue
    ? nextBenefitTierValue.minimumVolume - runningVolumeValue
    : 0;
  const nextBenefitTierEpochsValue = nextBenefitTierValue
    ? nextBenefitTierValue.epochs - epochsValue
    : 0;

  const baseCommissionTile = (
    <StatTile
      title={t('Base commission rate')}
      description={t('(Combined set volume %s over last %s epochs)', [
        compactNumFormat.format(runningVolumeValue),
        (details?.windowLength || DEFAULT_AGGREGATION_DAYS).toString(),
      ])}
    >
      {baseCommissionValue * 100}%
    </StatTile>
  );
  const stakingMultiplierTile = (
    <StatTile
      title={t('Staking multiplier')}
      description={`(${addDecimalsFormatNumber(
        stakeAvailable?.toString() || 0,
        18
      )} $VEGA staked)`}
    >
      {multiplier || t('None')}
    </StatTile>
  );
  const finalCommissionTile = (
    <StatTile
      title={t('Final commission rate')}
      description={
        !isNaN(multiplier)
          ? `(${baseCommissionValue * 100}% ⨉ ${multiplier} = ${
              finalCommissionValue * 100
            }%)`
          : undefined
      }
    >
      {finalCommissionValue * 100}%
    </StatTile>
  );
  const numberOfTradersValue = data.referees.length;
  const numberOfTradersTile = (
    <StatTile title={t('Number of traders')}>{numberOfTradersValue}</StatTile>
  );

  const codeTile = (
    <CodeTile
      code={data?.code}
      createdAt={getDateFormat().format(new Date(data.createdAt))}
    />
  );

  const referrerVolumeTile = (
    <StatTile
      title={t(
        'My volume (last %s epochs)',
        (details?.windowLength || DEFAULT_AGGREGATION_DAYS).toString()
      )}
    >
      {compactNumFormat.format(referrerVolumeValue)}
    </StatTile>
  );

  const totalCommissionValue = data.referees
    .map((r) => new BigNumber(r.totalRefereeGeneratedRewards))
    .reduce((all, r) => all.plus(r), new BigNumber(0));
  const totalCommissionTile = (
    <StatTile
      title={t(
        'Total commission (last %s epochs)',
        (details?.windowLength || DEFAULT_AGGREGATION_DAYS).toString()
      )}
      description={<QUSDTooltip />}
    >
      {getNumberFormat(0).format(Number(totalCommissionValue))}
    </StatTile>
  );

  const referrerTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
        {baseCommissionTile}
        {stakingMultiplierTile}
        {finalCommissionTile}
      </div>

      <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {codeTile}
        {referrerVolumeTile}
        {numberOfTradersTile}
        {totalCommissionTile}
      </div>
    </>
  );

  const currentBenefitTierTile = (
    <StatTile title={t('Current tier')}>
      {currentBenefitTierValue?.tier || 'None'}
    </StatTile>
  );
  const discountFactorTile = (
    <StatTile title={t('Discount')}>{discountFactorValue * 100}%</StatTile>
  );
  const runningVolumeTile = (
    <StatTile
      title={t(
        'Combined volume (last %s epochs)',
        details?.windowLength.toString()
      )}
    >
      {compactNumFormat.format(runningVolumeValue)}
    </StatTile>
  );
  const epochsTile = (
    <StatTile title={t('Epochs in set')}>{epochsValue}</StatTile>
  );
  const nextTierVolumeTile = (
    <StatTile title={t('Volume to next tier')}>
      {nextBenefitTierVolumeValue <= 0
        ? '0'
        : compactNumFormat.format(nextBenefitTierVolumeValue)}
    </StatTile>
  );
  const nextTierEpochsTile = (
    <StatTile title={t('Epochs to next tier')}>
      {nextBenefitTierEpochsValue <= 0 ? '0' : nextBenefitTierEpochsValue}
    </StatTile>
  );

  const refereeTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
        {currentBenefitTierTile}
        {discountFactorTile}
        {codeTile}
      </div>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {runningVolumeTile}
        {nextTierVolumeTile}
        {epochsTile}
        {nextTierEpochsTile}
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
        className={classNames(
          'grid grid-cols-1 grid-rows-1 gap-5 mx-auto mb-20'
        )}
      >
        {as === 'referrer' && referrerTiles}
        {as === 'referee' && refereeTiles}
      </div>

      {/* Referees (only for referrer view) */}
      {as === 'referrer' && data.referees.length > 0 && (
        <div className="mt-20 mb-20">
          <h2 className="mb-5 text-2xl">{t('Referees')}</h2>
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
                { name: 'party', displayName: t('Trader') },
                { name: 'joined', displayName: t('Date Joined') },
                {
                  name: 'volume',
                  displayName: t(
                    'Volume (last %s epochs)',
                    (
                      details?.windowLength || DEFAULT_AGGREGATION_DAYS
                    ).toString()
                  ),
                },
                {
                  name: 'commission',
                  displayName: (
                    <>
                      {t('Commission earned in')} <QUSDTooltip />{' '}
                      {t(
                        '(last %s epochs)',
                        (
                          details?.windowLength || DEFAULT_AGGREGATION_DAYS
                        ).toString()
                      )}
                    </>
                  ),
                },
              ]}
              data={sortBy(
                data.referees.map((r) => ({
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
                  volume: getNumberFormat(0).format(r.volume),
                  commission: getNumberFormat(0).format(r.commission),
                }))
                .reverse()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const QUSDTooltip = () => (
  <Tooltip
    description={
      <>
        <p className="mb-1">
          {t(
            'qUSD provides a rough USD equivalent of balances across all assets using the value of "Quantum" for that asset'
          )}
        </p>
        {DocsLinks && (
          <ExternalLink href={DocsLinks.QUANTUM}>
            {t('Find out more')}
          </ExternalLink>
        )}
      </>
    }
    underline={true}
  >
    <span>{t('qUSD')}</span>
  </Tooltip>
);
