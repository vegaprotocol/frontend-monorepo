import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import minBy from 'lodash/minBy';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import {
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
  TextChildrenTooltip as Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateFormat,
  getDateTimeFormat,
  getUserLocale,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { useReferralSetStatsQuery } from './hooks/__generated__/ReferralSetStats';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { useT, ns } from '../../lib/use-t';
import { useTeam } from '../../lib/hooks/use-team';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { TeamStats } from '../../components/competitions/team-stats';
import { Table } from '../../components/table';
import {
  DEFAULT_AGGREGATION_DAYS,
  useReferral,
  useUpdateReferees,
} from './hooks/use-referral';
import { ApplyCodeForm, ApplyCodeFormContainer } from './apply-code-form';
import { useReferralProgram } from './hooks/use-referral-program';
import { useEpochInfoQuery } from '../../lib/hooks/__generated__/Epoch';
import { QUSDTooltip } from './qusd-tooltip';
import { CodeTile, StatTile, Tile } from './tile';
import { areTeamGames, useGames } from '../../lib/hooks/use-games';

export const ReferralStatistics = () => {
  const { pubKey } = useVegaWallet();

  const program = useReferralProgram();

  const { data: referee, refetch: refereeRefetch } = useReferral({
    pubKey,
    role: 'referee',
    aggregationEpochs: program.details?.windowLength,
  });

  const { data: referrer, refetch: referrerRefetch } = useUpdateReferees(
    useReferral({
      pubKey,
      role: 'referrer',
      aggregationEpochs: program.details?.windowLength,
    }),
    DEFAULT_AGGREGATION_DAYS,
    ['totalRefereeGeneratedRewards'],
    DEFAULT_AGGREGATION_DAYS === program.details?.windowLength
  );

  const refetch = useCallback(() => {
    refereeRefetch();
    referrerRefetch();
  }, [refereeRefetch, referrerRefetch]);

  if (referee?.code) {
    return (
      <>
        <Statistics data={referee} program={program} as="referee" />
        {!referee.isEligible && <ApplyCodeForm />}
      </>
    );
  }

  if (referrer?.code) {
    return (
      <>
        <Statistics data={referrer} program={program} as="referrer" />
        <RefereesTable data={referrer} program={program} />
      </>
    );
  }

  return <ApplyCodeFormContainer onSuccess={refetch} />;
};

export const useStats = ({
  data,
  program,
}: {
  data?: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
}) => {
  const { benefitTiers } = program;
  const { data: epochData } = useEpochInfoQuery({
    fetchPolicy: 'network-only',
  });
  const { data: statsData } = useReferralSetStatsQuery({
    variables: {
      code: data?.code || '',
    },
    skip: !data?.code,
    fetchPolicy: 'cache-and-network',
  });

  const currentEpoch = Number(epochData?.epoch.id);

  const stats =
    statsData?.referralSetStats.edges &&
    compact(removePaginationWrapper(statsData.referralSetStats.edges));
  const refereeInfo = data?.referee;
  const refereeStats = stats?.find(
    (r) => r.partyId === data?.referee?.refereeId
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
    : new BigNumber(multiplier).times(baseCommissionValue).toNumber();

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
    ? benefitTiers.find((t) => t.tier === currentBenefitTierValue.tier + 1)
    : minBy(benefitTiers, (bt) => bt.tier); //  min tier number is lowest tier
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

  return {
    baseCommissionValue,
    runningVolumeValue,
    referrerVolumeValue,
    multiplier,
    finalCommissionValue,
    discountFactorValue,
    currentBenefitTierValue,
    nextBenefitTierValue,
    epochsValue,
    nextBenefitTierVolumeValue,
    nextBenefitTierEpochsValue,
  };
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
  const t = useT();
  const {
    baseCommissionValue,
    runningVolumeValue,
    referrerVolumeValue,
    multiplier,
    finalCommissionValue,
    discountFactorValue,
    currentBenefitTierValue,
    epochsValue,
    nextBenefitTierValue,
    nextBenefitTierVolumeValue,
    nextBenefitTierEpochsValue,
  } = useStats({ data, program });

  const isApplyCodePreview = data.referee === null;

  const { benefitTiers } = useReferralProgram();

  const { stakeAvailable, isEligible } = useStakeAvailable();
  const { details } = program;

  const compactNumFormat = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short',
  });

  const baseCommissionTile = (
    <StatTile
      title={t('Base commission rate')}
      description={t(
        '(Combined set volume {{runningVolume}} over last {{epochs}} epochs)',
        {
          runningVolume: compactNumFormat.format(runningVolumeValue),
          epochs: (
            details?.windowLength || DEFAULT_AGGREGATION_DAYS
          ).toString(),
        }
      )}
      testId="base-commission-rate"
      overrideWithNoProgram={!details}
    >
      {baseCommissionValue * 100}%
    </StatTile>
  );

  const stakingMultiplierTile = (
    <StatTile
      title={t('Staking multiplier')}
      testId="staking-multiplier"
      description={
        <span
          className={classNames({
            'text-vega-red': !isEligible,
          })}
        >
          {t('{{amount}} $VEGA staked', {
            amount: addDecimalsFormatNumber(
              stakeAvailable?.toString() || 0,
              18
            ),
          })}
        </span>
      }
      overrideWithNoProgram={!details}
    >
      {multiplier || t('None')}
    </StatTile>
  );
  const baseCommissionFormatted = BigNumber(baseCommissionValue)
    .times(100)
    .toString();
  const finalCommissionFormatted = new BigNumber(finalCommissionValue)
    .times(100)
    .toString();
  const finalCommissionTile = (
    <StatTile
      title={t('Final commission rate')}
      description={
        !isNaN(multiplier)
          ? `(${baseCommissionFormatted}% ⨉ ${multiplier} = ${finalCommissionFormatted}%)`
          : undefined
      }
      testId="final-commission-rate"
      overrideWithNoProgram={!details}
    >
      {finalCommissionFormatted}%
    </StatTile>
  );
  const numberOfTradersValue = data.referees.length;
  const numberOfTradersTile = (
    <StatTile title={t('Number of traders')} testId="number-of-traders">
      {numberOfTradersValue}
    </StatTile>
  );

  const codeTile = (
    <CodeTile
      code={data?.code}
      createdAt={getDateFormat().format(new Date(data.createdAt))}
    />
  );

  const referrerVolumeTile = (
    <StatTile
      title={t('myVolume', 'My volume (last {{count}} epochs)', {
        count: details?.windowLength || DEFAULT_AGGREGATION_DAYS,
      })}
      testId="my-volume"
      overrideWithNoProgram={!details}
    >
      {compactNumFormat.format(referrerVolumeValue)}
    </StatTile>
  );

  const totalCommissionValue = data.referees
    .map((r) => new BigNumber(r.totalRefereeGeneratedRewards))
    .reduce((all, r) => all.plus(r), new BigNumber(0));
  const totalCommissionTile = (
    <StatTile
      testId="total-commission"
      title={
        <Trans
          i18nKey="totalCommission"
          defaults="Total commission (<0>last {{count}} epochs</0>)"
          values={{
            count: DEFAULT_AGGREGATION_DAYS,
          }}
          components={[
            <Tooltip
              key="1"
              description={t(
                'Depending on data node retention you may not be able see the full 30 days'
              )}
            >
              last 30 epochs
            </Tooltip>,
          ]}
        />
      }
      description={<QUSDTooltip />}
    >
      {formatNumber(totalCommissionValue, 0)}
    </StatTile>
  );

  const currentBenefitTierTile = (
    <StatTile
      title={t('Current tier')}
      testId="current-tier"
      description={
        nextBenefitTierValue?.tier
          ? t('(Next tier: {{nextTier}})', {
              nextTier: nextBenefitTierValue?.tier,
            })
          : undefined
      }
      overrideWithNoProgram={!details}
    >
      {isApplyCodePreview
        ? currentBenefitTierValue?.tier || benefitTiers[0]?.tier || 'None'
        : currentBenefitTierValue?.tier || 'None'}
    </StatTile>
  );
  const discountFactorTile = (
    <StatTile
      title={t('Discount')}
      testId="discount"
      overrideWithNoProgram={!details}
    >
      {isApplyCodePreview && benefitTiers.length >= 1
        ? benefitTiers[0].discountFactor * 100
        : discountFactorValue * 100}
      %
    </StatTile>
  );
  const runningVolumeTile = (
    <StatTile
      title={t(
        'runningNotionalOverEpochs',
        'Combined volume (last {{count}} epochs)',
        {
          count: details?.windowLength,
        }
      )}
      testId="combined-volume"
      overrideWithNoProgram={!details}
    >
      {compactNumFormat.format(runningVolumeValue)}
    </StatTile>
  );
  const epochsTile = (
    <StatTile title={t('Epochs in set')} testId="epochs-in-set">
      {epochsValue}
    </StatTile>
  );
  const nextTierVolumeTile = (
    <StatTile
      title={t('Volume to next tier')}
      testId="vol-to-next-tier"
      overrideWithNoProgram={!details}
    >
      {nextBenefitTierVolumeValue <= 0
        ? '0'
        : compactNumFormat.format(nextBenefitTierVolumeValue)}
    </StatTile>
  );
  const nextTierEpochsTile = (
    <StatTile
      title={t('Epochs to next tier')}
      testId="epochs-to-next-tier"
      overrideWithNoProgram={!details}
    >
      {nextBenefitTierEpochsValue <= 0 ? '0' : nextBenefitTierEpochsValue}
    </StatTile>
  );

  const eligibilityWarningOverlay = as === 'referee' && !isEligible && (
    <div
      data-testid="referral-eligibility-warning"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-1/2 lg:w-1/3"
    >
      <h2 className="text-2xl mb-2">{t('Referral code no longer valid')}</h2>
      <p>
        {t(
          'Your referral code is no longer valid as the referrer no longer meets the minimum requirements. Apply a new code to continue receiving discounts.'
        )}
      </p>
    </div>
  );

  const referrerTiles = (
    <>
      <Team teamId={data.code} />
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

  const refereeTiles = (
    <>
      <Team teamId={data.code} />
      <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
        {currentBenefitTierTile}
        {runningVolumeTile}
        {codeTile}
      </div>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {discountFactorTile}
        {nextTierVolumeTile}
        {epochsTile}
        {nextTierEpochsTile}
      </div>
    </>
  );

  return (
    <div
      data-testid="referral-statistics"
      data-as={as}
      className="relative mx-auto mb-20"
    >
      <div
        className={classNames('grid grid-cols-1 grid-rows-1 gap-5', {
          'opacity-20 pointer-events-none': as === 'referee' && !isEligible,
        })}
      >
        {as === 'referrer' && referrerTiles}
        {as === 'referee' && refereeTiles}
      </div>
      {eligibilityWarningOverlay}
    </div>
  );
};

export const RefereesTable = ({
  data,
  program,
}: {
  data: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
}) => {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const { details } = program;
  useLayoutEffect(() => {
    if ((tableRef.current?.getBoundingClientRect().height || 0) > 384) {
      setCollapsed(true);
    }
  }, []);
  return (
    <>
      {/* Referees (only for referrer view) */}
      {data.referees.length > 0 && (
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
                    'volumeLastEpochs',
                    'Volume (last {{count}} epochs)',
                    {
                      count: details?.windowLength || DEFAULT_AGGREGATION_DAYS,
                    }
                  ),
                },
                {
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

const Team = ({ teamId }: { teamId?: string }) => {
  const { team, members } = useTeam(teamId);
  const { data: games } = useGames(teamId);

  if (!team) return null;

  return (
    <Tile className="flex gap-3 lg:gap-4">
      <TeamAvatar teamId={team.teamId} imgUrl={team.avatarUrl} />
      <div className="flex flex-col items-start gap-1 lg:gap-3">
        <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">{team.name}</h1>
        <TeamStats
          members={members}
          games={areTeamGames(games) ? games : undefined}
        />
      </div>
    </Tile>
  );
};
