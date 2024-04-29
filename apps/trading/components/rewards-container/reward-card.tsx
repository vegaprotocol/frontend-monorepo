import { useT } from '../../lib/use-t';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import classNames from 'classnames';
import {
  type VegaIconSize,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
  TradingButton,
  Dialog,
} from '@vegaprotocol/ui-toolkit';
import {
  DistributionStrategyDescriptionMapping,
  DistributionStrategyMapping,
  EntityScope,
  EntityScopeMapping,
  DispatchMetric,
  DispatchMetricDescription,
  DispatchMetricLabels,
  EntityScopeLabelMapping,
  MarketState,
  type DispatchStrategy,
  IndividualScopeDescriptionMapping,
  IndividualScope,
  type Asset,
  type Team,
  IndividualScopeMapping,
  type StakingRewardMetric,
  type StakingDispatchStrategy,
  type DistributionStrategy,
} from '@vegaprotocol/types';
import { useState, type ReactNode } from 'react';
import { type BasicAssetDetails } from '@vegaprotocol/assets';
import {
  isScopedToTeams,
  type EnrichedRewardTransfer,
} from '../../lib/hooks/use-rewards';
import compact from 'lodash/compact';
import BigNumber from 'bignumber.js';
import { useTWAPQuery } from '../../lib/hooks/__generated__/Rewards';
import { RankPayoutTable } from './rank-table';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';
import max from 'lodash/max';
import min from 'lodash/min';
import flatten from 'lodash/flatten';
import sum from 'lodash/sum';

const Tick = () => (
  <VegaIcon
    name={VegaIconNames.TICK}
    size={12}
    className="text-vega-green-500"
  />
);

const Cross = () => (
  <VegaIcon
    name={VegaIconNames.CROSS}
    size={12}
    className="text-vega-red-500"
  />
);

/** Eligibility requirements for rewards */
export type Requirements = {
  isEligible: boolean;
  stakeAvailable?: bigint;
  team?: Partial<Team>;
  pubKey: string;
};

const GroupCard = ({
  colour,
  rewardAmount,
  dispatchMetric,
  transferAsset,
  entityScope,
  distributionStrategy,
  distributionDelay,
  count,
  onClick,
}: {
  colour: CardColour;
  rewardAmount: string;
  dispatchMetric: DispatchMetric | StakingDispatchStrategy['dispatchMetric'];
  transferAsset?: Asset | undefined;
  entityScope?: EntityScope;
  distributionStrategy?: DistributionStrategy;
  distributionDelay?: string | number;
  count: number;
  onClick: () => void;
}) => {
  const t = useT();

  return (
    <div data-reward-card className="min-h-[366px] h-full">
      <div
        className={classNames(
          'bg-gradient-to-r col-span-full p-0.5 lg:col-auto h-full',
          'rounded-lg',
          CardColourStyles[colour].gradientClassName
        )}
        data-testid="active-rewards-card"
      >
        <div
          className={classNames(
            CardColourStyles[colour].mainClassName,
            'bg-gradient-to-b bg-vega-clight-800 dark:bg-vega-cdark-800 h-full w-full rounded-md p-4',
            'flex flex-col gap-4 justify-items-start'
          )}
        >
          <div
            className={classNames(
              'flex justify-between gap-2',
              'pb-3 border-b-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500'
            )}
          >
            {/** ENTITY SCOPE */}
            <div className="flex flex-col gap-2 items-center text-center">
              {entityScope && (
                <>
                  <EntityIcon entityScope={entityScope} />
                  <span
                    className="text-muted text-xs"
                    data-testid="entity-scope"
                  >
                    {EntityScopeLabelMapping[entityScope] || t('Unspecified')}
                  </span>
                </>
              )}
            </div>

            {/** AMOUNT AND DISTRIBUTION STRATEGY */}
            <div className="flex flex-col gap-2 items-center text-center">
              {/** AMOUNT */}
              <h3 className="flex flex-col gap-1 text-2xl shrink-1 text-center">
                <span>
                  {t('Up to')}{' '}
                  <span className="font-glitch" data-testid="reward-value">
                    {rewardAmount}
                  </span>
                </span>

                <span className="font-alpha" data-testid="reward-asset">
                  {transferAsset?.symbol || ''}
                </span>
              </h3>

              {/** DISTRIBUTION STRATEGY */}
              {distributionStrategy && (
                <Tooltip
                  description={
                    <div className="flex flex-col gap-4">
                      <p>
                        {t(
                          DistributionStrategyDescriptionMapping[
                            distributionStrategy
                          ]
                        )}
                        .
                      </p>
                    </div>
                  }
                  underline={true}
                >
                  <span className="text-xs" data-testid="distribution-strategy">
                    {DistributionStrategyMapping[distributionStrategy]}
                  </span>
                </Tooltip>
              )}
            </div>

            {/** DISTRIBUTION DELAY */}
            <DistributionDelay value={distributionDelay} />
          </div>

          <div className={classNames('flex flex-col gap-3 h-full')}>
            {/** DISPATCH METRIC */}
            <span data-testid="dispatch-metric-info">
              {DispatchMetricLabels[dispatchMetric]}
            </span>
            {/** DISPATCH METRIC DESCRIPTION */}
            <p className="text-muted text-sm">
              {t(DispatchMetricDescription[dispatchMetric])}
            </p>
          </div>

          <div>
            <TradingButton
              intent={null}
              className={classNames(CardColourStyles[colour].btn, 'w-full')}
              onClick={onClick}
            >
              {t('See details of {{count}} rewards', { count })}
            </TradingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardCard = ({
  colour,
  rewardAmount,
  dispatchAsset,
  transferAsset,
  vegaAsset,
  dispatchStrategy,
  startsIn,
  endsIn,
  dispatchMetricInfo,
  requirements,
  gameId,
}: {
  colour: CardColour;
  rewardAmount: string;
  /** The asset linked to the dispatch strategy via `dispatchMetricAssetId` property. */
  dispatchAsset?: BasicAssetDetails;
  /** The VEGA asset details, required to format the min staking amount. */
  transferAsset?: Asset | undefined;
  /** The VEGA asset details, required to format the min staking amount. */
  vegaAsset?: BasicAssetDetails;
  /** The transfer's dispatch strategy. */
  dispatchStrategy: DispatchStrategy | StakingDispatchStrategy;
  /** The number of epochs until the transfer starts. */
  startsIn?: number;
  /** The number of epochs until the transfer stops. */
  endsIn?: number;
  dispatchMetricInfo?: ReactNode;
  /** Eligibility requirements for rewards */
  requirements?: Requirements;
  /** The game id of the transfer */
  gameId?: string | null;
}) => {
  const t = useT();

  return (
    <div data-reward-card className="min-h-[366px] h-full">
      <div
        className={classNames(
          'bg-gradient-to-r col-span-full p-0.5 lg:col-auto h-full',
          'rounded-lg',
          CardColourStyles[colour].gradientClassName
        )}
        data-testid="active-rewards-card"
      >
        <div
          className={classNames(
            CardColourStyles[colour].mainClassName,
            'bg-gradient-to-b bg-vega-clight-800 dark:bg-vega-cdark-800 h-full w-full rounded-md p-4 flex flex-col gap-4'
          )}
        >
          <div
            className={classNames(
              'flex justify-between gap-4',
              'pb-4 border-b-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500'
            )}
          >
            {/** ENTITY SCOPE */}
            <div className="flex flex-col gap-2 items-center text-center">
              <EntityIcon entityScope={dispatchStrategy.entityScope} />
              {dispatchStrategy.entityScope && (
                <span className="text-muted text-xs" data-testid="entity-scope">
                  {EntityScopeLabelMapping[dispatchStrategy.entityScope] ||
                    t('Unspecified')}
                </span>
              )}
            </div>

            {/** AMOUNT AND DISTRIBUTION STRATEGY */}
            <div className="flex flex-col gap-2 items-center text-center">
              {/** AMOUNT */}
              <h3 className="flex flex-col gap-1 text-2xl shrink-1 text-center">
                <span className="font-glitch" data-testid="reward-value">
                  {rewardAmount}
                </span>

                <span className="font-alpha" data-testid="reward-asset">
                  {transferAsset?.symbol || ''}
                </span>
              </h3>

              {/** DISTRIBUTION STRATEGY */}
              <Tooltip
                description={
                  <div className="flex flex-col gap-4">
                    <p>
                      {t(
                        DistributionStrategyDescriptionMapping[
                          dispatchStrategy.distributionStrategy
                        ]
                      )}
                      .
                    </p>

                    <p>
                      {dispatchStrategy.rankTable &&
                        t(
                          'Payout percentages are base estimates assuming no individual reward multipliers are active. If users in teams have active multipliers, the reward amounts may vary.'
                        )}
                    </p>

                    {dispatchStrategy.rankTable && (
                      <RankPayoutTable rankTable={dispatchStrategy.rankTable} />
                    )}
                  </div>
                }
                underline={true}
              >
                <span className="text-xs" data-testid="distribution-strategy">
                  {
                    DistributionStrategyMapping[
                      dispatchStrategy.distributionStrategy
                    ]
                  }
                </span>
              </Tooltip>
            </div>

            {/** DISTRIBUTION DELAY */}
            <DistributionDelay value={dispatchStrategy.lockPeriod} />
          </div>

          <div className="h-full flex flex-col gap-4">
            {/** DISPATCH METRIC */}
            <div>
              {dispatchMetricInfo ? (
                dispatchMetricInfo
              ) : (
                <span data-testid="dispatch-metric-info">
                  {DispatchMetricLabels[dispatchStrategy.dispatchMetric]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-8 flex-wrap">
              {/** ENDS IN or STARTS IN */}
              {startsIn ? (
                <span className="flex flex-col">
                  <span className="text-muted text-xs">{t('Starts in')} </span>
                  <span data-testid="starts-in" data-startsin={startsIn}>
                    {t('numberEpochs', '{{count}} epochs', {
                      count: startsIn,
                    })}
                  </span>
                </span>
              ) : (
                endsIn && (
                  <span className="flex flex-col">
                    <span className="text-muted text-xs">{t('Ends in')} </span>
                    <span data-testid="ends-in" data-endsin={endsIn}>
                      {endsIn >= 0
                        ? t('numberEpochs', '{{count}} epochs', {
                            count: endsIn,
                          })
                        : t('Ended')}
                    </span>
                  </span>
                )
              )}
              {/** WINDOW LENGTH */}
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Assessed over')}</span>
                <span data-testid="assessed-over">
                  {t('numberEpochs', '{{count}} epochs', {
                    count: dispatchStrategy.windowLength,
                  })}
                </span>
              </span>
              {/** CAPPED AT */}
              {dispatchStrategy.capRewardFeeMultiple && (
                <span className="flex flex-col">
                  <span className="text-muted text-xs">{t('Capped at')}</span>
                  <Tooltip
                    description={t(
                      'Reward will be capped at {{capRewardFeeMultiple}} X of taker fees paid in the epoch',
                      {
                        capRewardFeeMultiple:
                          dispatchStrategy.capRewardFeeMultiple,
                      }
                    )}
                  >
                    <span data-testid="cappedAt">
                      x{dispatchStrategy.capRewardFeeMultiple}
                    </span>
                  </Tooltip>
                </span>
              )}
            </div>

            {/** DISPATCH METRIC DESCRIPTION */}
            {dispatchStrategy?.dispatchMetric && (
              <p className="text-muted text-sm">
                {t(DispatchMetricDescription[dispatchStrategy?.dispatchMetric])}
              </p>
            )}
          </div>

          {/** REQUIREMENTS */}
          {dispatchStrategy && (
            <div className="pt-4 border-t-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500">
              <RewardRequirements
                dispatchStrategy={dispatchStrategy}
                dispatchAsset={dispatchAsset}
                vegaAsset={vegaAsset}
                requirements={requirements}
                gameId={gameId}
                startsIn={startsIn}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DispatchMetricInfo = ({
  reward,
}: {
  reward: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
}) => {
  const t = useT();
  const dispatchMetric = reward.transfer.kind.dispatchStrategy?.dispatchMetric;
  const markets = compact(
    reward.markets?.map((m, i) => [
      m.tradableInstrument.instrument.code,
      m.tradableInstrument.instrument.name,
      <Link className="underline" key={i} to={Links.MARKET(m.id)}>
        {m.tradableInstrument.instrument.name}
      </Link>,
    ])
  );

  let additionalDispatchMetricInfo = null;

  // if asset found then display asset symbol
  if (
    reward.dispatchAsset &&
    reward.transfer.kind.dispatchStrategy.dispatchMetric !==
      'STAKING_REWARD_METRIC'
  ) {
    additionalDispatchMetricInfo = (
      <Tooltip
        description={t(
          'This reward is scoped to the markets settled in {{asset}}',
          {
            asset: reward.dispatchAsset.symbol,
          }
        )}
      >
        <span className="underline cursor-help">
          {reward.dispatchAsset.symbol}
        </span>
      </Tooltip>
    );
  }
  // but if scoped to only one market then display market name
  if (markets.length === 1) {
    const [code, , link] = markets[0];
    additionalDispatchMetricInfo = (
      <Tooltip
        description={t('This reward is scoped to {{market}} market', {
          market: code,
        })}
      >
        <span>{link}</span>
      </Tooltip>
    );
  }
  // or if scoped to many markets then indicate it's scoped to "specific markets"
  if (markets.length > 1) {
    const description = (
      <div>
        <p>{t('This reward is scoped to the following markets')}:</p>
        <ol className="list-decimal pl-3">
          {markets.map(([, , link], i) => (
            <li key={i}>{link}</li>
          ))}
        </ol>
      </div>
    );
    additionalDispatchMetricInfo = (
      <Tooltip description={description}>
        <span className="underline cursor-help">{t('Specific markets')}</span>
      </Tooltip>
    );
  }

  return (
    <span data-testid="dispatch-metric-info" className="h-12">
      {dispatchMetric ? DispatchMetricLabels[dispatchMetric] : t('Unknown')}
      {additionalDispatchMetricInfo != null && (
        <> • {additionalDispatchMetricInfo}</>
      )}
    </span>
  );
};

const RewardRequirements = ({
  dispatchStrategy,
  dispatchAsset,
  vegaAsset,
  requirements,
  gameId,
  startsIn,
}: {
  dispatchStrategy: DispatchStrategy | StakingDispatchStrategy;
  dispatchAsset?: BasicAssetDetails;
  vegaAsset?: BasicAssetDetails;
  requirements?: Requirements;
  gameId?: string | null;
  startsIn?: number;
}) => {
  const t = useT();

  const entityLabel = EntityScopeLabelMapping[dispatchStrategy.entityScope];

  const stakingRequirement = dispatchStrategy.stakingRequirement;
  const stakeAvailable = requirements?.stakeAvailable;
  const averagePositionRequirements =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  const featureFlags = useFeatureFlags((state) => state.flags);

  const { data: twap } = useTWAPQuery({
    variables: {
      gameId: gameId || '',
      partyId: requirements?.pubKey || '',
      assetId: dispatchAsset?.id || '',
    },
    skip: !featureFlags.TWAP_REWARDS || !requirements,
    errorPolicy: 'ignore',
  });
  const averagePosition =
    twap && twap?.timeWeightedNotionalPosition?.timeWeightedNotionalPosition;

  const averagePositionFormatted =
    averagePosition &&
    addDecimalsFormatNumber(averagePosition, dispatchAsset?.decimals || 0);

  const averagePositionRequirementsFormatted =
    averagePositionRequirements &&
    addDecimalsFormatNumber(
      averagePositionRequirements,
      dispatchAsset?.decimals || 0
    );

  return (
    <dl className="flex justify-between flex-wrap items-center gap-3 text-xs">
      {/** SCOPE */}
      <div className="flex flex-col gap-1">
        <dt className="flex items-center gap-1 text-muted">
          {entityLabel
            ? t('{{entity}} scope', {
                entity: entityLabel,
              })
            : t('Scope')}
        </dt>
        <dd className="flex items-center gap-1" data-testid="scope">
          <RewardEntityScope
            dispatchStrategy={dispatchStrategy}
            requirements={requirements}
          />
        </dd>
      </div>

      {/** STAKING REQUIREMENT */}
      <div className="flex flex-col gap-1">
        <dt className="flex items-center gap-1 text-muted">
          {t('Staked VEGA')}
        </dt>
        <dd
          className="flex items-center gap-1"
          data-testid="staking-requirement"
        >
          {!stakingRequirement
            ? ''
            : requirements &&
              (new BigNumber(
                stakingRequirement.toString() || 0
              ).isLessThanOrEqualTo(stakeAvailable?.toString() || 0) ? (
                <Tick />
              ) : (
                <Cross />
              ))}
          {!stakingRequirement
            ? '-'
            : requirements && stakeAvailable
            ? addDecimalsFormatNumber(
                (stakeAvailable || 0).toString(),
                vegaAsset?.decimals || 18
              )
            : addDecimalsFormatNumber(
                stakingRequirement.toString() || 0,
                vegaAsset?.decimals || 18
              )}
        </dd>
      </div>

      {/** AVERAGE POSITION REQUIREMENT */}
      <div className="flex flex-col gap-1">
        <dt className="flex items-center gap-1 text-muted">
          {t('Average position')}
        </dt>
        <Tooltip
          description={
            averagePosition
              ? t(
                  'Your average position is {{averagePosition}}, and the requirement is {{averagePositionRequirements}}',
                  {
                    averagePosition: averagePositionFormatted,
                    averagePositionRequirements:
                      averagePositionRequirementsFormatted,
                  }
                )
              : averagePositionRequirements &&
                t(
                  'The average position requirement is {{averagePositionRequirements}}',
                  {
                    averagePositionRequirements:
                      averagePositionRequirementsFormatted,
                  }
                )
          }
        >
          <dd
            className="flex items-center gap-1"
            data-testid="average-position"
          >
            {requirements &&
              featureFlags.TWAP_REWARDS &&
              averagePositionRequirements &&
              !startsIn &&
              (new BigNumber(averagePosition || 0).isGreaterThan(
                averagePositionRequirements
              ) ? (
                <Tick />
              ) : (
                <Cross />
              ))}
            {averagePositionFormatted ||
              averagePositionRequirementsFormatted ||
              '-'}
          </dd>
        </Tooltip>
      </div>
    </dl>
  );
};

const RewardEntityScope = ({
  dispatchStrategy,
  requirements,
}: {
  dispatchStrategy: DispatchStrategy | StakingDispatchStrategy;
  requirements?: Requirements;
}) => {
  const t = useT();
  const listedTeams = dispatchStrategy.teamScope;

  if (!requirements) {
    if (dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_TEAMS) {
      return (
        <Tooltip
          description={
            dispatchStrategy.teamScope?.length ? (
              <div className="text-xs">
                <p className="mb-1">{t('Eligible teams')}</p>
                <ul>
                  {dispatchStrategy.teamScope.map((teamId) => {
                    if (!teamId) return null;
                    return <li key={teamId}>{truncateMiddle(teamId)}</li>;
                  })}
                </ul>
              </div>
            ) : (
              t('All teams are eligible')
            )
          }
        >
          <span>
            {dispatchStrategy.teamScope?.length
              ? t('Some teams')
              : t('All teams')}
          </span>
        </Tooltip>
      );
    }

    if (
      dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_INDIVIDUALS &&
      dispatchStrategy.individualScope
    ) {
      return (
        <Tooltip
          description={
            IndividualScopeDescriptionMapping[dispatchStrategy.individualScope]
          }
        >
          <span>
            {IndividualScopeMapping[dispatchStrategy.individualScope]}
          </span>
        </Tooltip>
      );
    }

    return t('Unspecified');
  }

  const isEligible = () => {
    const isInTeam =
      listedTeams?.find((team) => team === requirements?.team?.teamId) || false;
    const teamsList = listedTeams && (
      <ul>
        {listedTeams.map((teamId) => {
          if (!teamId) return null;
          return <li key={teamId}>{truncateMiddle(teamId)}</li>;
        })}
      </ul>
    );

    if (
      dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_TEAMS &&
      !listedTeams &&
      !requirements?.team
    ) {
      return { tooltip: t('Not in a team'), eligible: false };
    }

    if (
      dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_TEAMS &&
      !listedTeams
    ) {
      return { tooltip: t('All teams'), eligible: true };
    }

    if (
      dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_TEAMS &&
      listedTeams
    ) {
      return {
        tooltip: (
          <div className="text-xs">
            <p className="mb-1">{t('Eligible teams')}</p> {teamsList}
          </div>
        ),
        eligible: isInTeam,
      };
    }

    if (dispatchStrategy.entityScope === EntityScope.ENTITY_SCOPE_INDIVIDUALS) {
      switch (dispatchStrategy.individualScope) {
        case IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM:
          return {
            tooltip: (
              <div className="text-xs">
                <p className="mb-1">{t('Teams individuals')}</p> {teamsList}
              </div>
            ),
            eligible: isInTeam,
          };
        case IndividualScope.INDIVIDUAL_SCOPE_NOT_IN_TEAM:
          return { tooltip: t('Solo individuals'), eligible: true };
        case IndividualScope.INDIVIDUAL_SCOPE_ALL:
          return { tooltip: t('All individuals'), eligible: true };
      }
    }

    return { tooltip: t('Unspecified'), eligible: false };
  };

  const { tooltip, eligible } = isEligible();
  const tickOrCross = requirements ? eligible ? <Tick /> : <Cross /> : null;

  const eligibilityLabel = eligible ? t('Eligible') : t('Not eligible');

  return (
    <Tooltip description={tooltip}>
      <span className="flex items-center gap-1">
        {tickOrCross} {requirements ? eligibilityLabel : tooltip}
      </span>
    </Tooltip>
  );
};

enum CardColour {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  GREY = 'GREY',
  ORANGE = 'ORANGE',
  PINK = 'PINK',
  PURPLE = 'PURPLE',
  WHITE = 'WHITE',
  YELLOW = 'YELLOW',
}

const CardColourStyles: Record<
  CardColour,
  { gradientClassName: string; mainClassName: string; btn: string }
> = {
  [CardColour.BLUE]: {
    gradientClassName: 'from-vega-blue-500 to-vega-green-400',
    mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-blue-500 from-50% to-vega-green-400 !text-white',
  },
  [CardColour.GREEN]: {
    gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
    mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-green-500 from-50% to-vega-yellow-400 !text-black',
  },
  [CardColour.GREY]: {
    gradientClassName: 'from-vega-cdark-500 to-vega-clight-200',
    mainClassName: 'from-vega-cdark-400 dark:from-vega-cdark-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-cdark-500 from-50% to-vega-clight-200 !text-white',
  },
  [CardColour.ORANGE]: {
    gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
    mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-orange-500 from-50% to-vega-pink-600 !text-black',
  },
  [CardColour.PINK]: {
    gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
    mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-pink-500 from-50% to-vega-purple-600 !text-white',
  },
  [CardColour.PURPLE]: {
    gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
    mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-purple-500 from-50% to-vega-blue-600 !text-white',
  },
  [CardColour.WHITE]: {
    gradientClassName:
      'from-vega-clight-600 dark:from-vega-clight-900 to-vega-yellow-500 dark:to-vega-yellow-400',
    mainClassName: 'from-white dark:from-vega-clight-100 to-20%',
    btn: '!bg-gradient-to-br from-white from-50% to-vega-yellow-500 !text-black',
  },
  [CardColour.YELLOW]: {
    gradientClassName: 'from-vega-yellow-500 to-vega-orange-400',
    mainClassName: 'from-vega-yellow-400 dark:from-vega-yellow-600 to-20%',
    btn: '!bg-gradient-to-br from-vega-yellow-500 from-50% to-vega-orange-400 !text-black',
  },
};

const DispatchMetricColourMap: Record<
  DispatchMetric | StakingRewardMetric,
  CardColour
> = {
  // Liquidity provision fees received
  [DispatchMetric.DISPATCH_METRIC_LP_FEES_RECEIVED]: CardColour.BLUE,
  // Price maker fees paid
  [DispatchMetric.DISPATCH_METRIC_MAKER_FEES_PAID]: CardColour.PINK,
  // Price maker fees earned
  [DispatchMetric.DISPATCH_METRIC_MAKER_FEES_RECEIVED]: CardColour.GREEN,
  // Total market value
  [DispatchMetric.DISPATCH_METRIC_MARKET_VALUE]: CardColour.WHITE,
  // Average position
  [DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION]: CardColour.ORANGE,
  // Relative return
  [DispatchMetric.DISPATCH_METRIC_RELATIVE_RETURN]: CardColour.PURPLE,
  // Return volatility
  [DispatchMetric.DISPATCH_METRIC_RETURN_VOLATILITY]: CardColour.YELLOW,
  // Validator ranking
  [DispatchMetric.DISPATCH_METRIC_VALIDATOR_RANKING]: CardColour.WHITE,
  STAKING_REWARD_METRIC: CardColour.WHITE,
  [DispatchMetric.DISPATCH_METRIC_REALISED_RETURN]: CardColour.BLUE,
};

const CardIcon = ({
  size = 18,
  iconName,
  tooltip,
}: {
  size?: VegaIconSize;
  iconName: VegaIconNames;
  tooltip: string;
}) => {
  return (
    <Tooltip description={<span>{tooltip}</span>}>
      <span className="flex items-center p-2 rounded-full border border-gray-600">
        <VegaIcon name={iconName} size={size} />
      </span>
    </Tooltip>
  );
};

const EntityScopeIconMap: Record<EntityScope, VegaIconNames> = {
  [EntityScope.ENTITY_SCOPE_TEAMS]: VegaIconNames.TEAM,
  [EntityScope.ENTITY_SCOPE_INDIVIDUALS]: VegaIconNames.MAN,
};

const EntityIcon = ({
  entityScope,
  size = 18,
}: {
  entityScope: EntityScope;
  size?: VegaIconSize;
}) => {
  return (
    <Tooltip
      description={
        entityScope ? <span>{EntityScopeMapping[entityScope]}</span> : undefined
      }
    >
      <span className="flex items-center p-2 rounded-full border border-gray-600">
        <VegaIcon
          name={EntityScopeIconMap[entityScope] || VegaIconNames.QUESTION_MARK}
          size={size}
        />
      </span>
    </Tooltip>
  );
};

export const areAllMarketsSettled = (
  transferNode: Pick<
    EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>,
    'markets'
  >
) => {
  const settledMarkets = transferNode.markets?.filter(
    (m) =>
      m?.data?.marketState &&
      [
        MarketState.STATE_TRADING_TERMINATED,
        MarketState.STATE_SETTLED,
        MarketState.STATE_CANCELLED,
        MarketState.STATE_CLOSED,
      ].includes(m?.data?.marketState)
  );

  return (
    settledMarkets?.length === transferNode.markets?.length &&
    Boolean(transferNode.markets && transferNode.markets.length > 0)
  );
};

export const areAllMarketsSuspended = (
  transferNode: Pick<
    EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>,
    'markets'
  >
) => {
  return (
    transferNode.markets?.filter(
      (m) =>
        m?.data?.marketState === MarketState.STATE_SUSPENDED ||
        m?.data?.marketState === MarketState.STATE_SUSPENDED_VIA_GOVERNANCE
    ).length === transferNode.markets?.length &&
    Boolean(transferNode.markets && transferNode.markets.length > 0)
  );
};

export const GroupRewardCard = ({
  transferNodes,
  currentEpoch,
  requirements,
}: {
  transferNodes: EnrichedRewardTransfer<
    DispatchStrategy | StakingDispatchStrategy
  >[];
  currentEpoch: number;
  requirements?: Requirements;
}) => {
  const startsIns = transferNodes.map(
    (n) => n.transfer.kind.startEpoch - currentEpoch
  );
  const allNotStarted =
    startsIns.filter((s) => s > 0).length === startsIns.length &&
    startsIns.length > 0;
  const allNotTraded =
    transferNodes.filter((n) => !n.isAssetTraded).length ===
    transferNodes.length;
  const markets = compact(flatten(transferNodes.map((n) => n.markets)));

  const dispatchStrategies = transferNodes.map(
    (n) => n.transfer.kind.dispatchStrategy
  );

  let colour = DispatchMetricColourMap[dispatchStrategies[0].dispatchMetric];

  /**
   * Display the card as grey if any of the condition is `true`:
   *
   * - all markets scoped to the reward are settled
   * - all markets scoped to the reward are suspended
   * - the reward's asset is not actively traded on any of the active markets
   * - it start in the future
   *
   */
  if (
    areAllMarketsSettled({ markets }) ||
    areAllMarketsSuspended({ markets }) ||
    allNotTraded ||
    allNotStarted
  ) {
    colour = CardColour.GREY;
  }

  const rewardAmounts = transferNodes.map((n) =>
    toBigNum(n.transfer.amount, n.transfer.asset?.decimals || 0).toNumber()
  );
  const maxRewardAmount = sum(rewardAmounts) as number;
  const rewardAmount = formatNumber(maxRewardAmount, 6);

  const transferAsset = transferNodes[0].transfer.asset || undefined;

  const dispatchMetric =
    transferNodes[0].transfer.kind.dispatchStrategy.dispatchMetric;

  const entityScope =
    transferNodes[0].transfer.kind.dispatchStrategy.entityScope;

  const distributionStrategy =
    transferNodes[0].transfer.kind.dispatchStrategy.distributionStrategy;

  const delays = transferNodes.map(
    (n) => n.transfer.kind.dispatchStrategy.lockPeriod
  );
  const minDelay = min(delays) || 0;
  const maxDelay = max(delays) || 0;

  const distributionDelay =
    minDelay === maxDelay ? minDelay : `${minDelay} - ${maxDelay}`;

  const [open, setOpen] = useState(false);

  return (
    <>
      <GroupCard
        colour={colour}
        rewardAmount={rewardAmount}
        transferAsset={transferAsset}
        dispatchMetric={dispatchMetric}
        entityScope={entityScope}
        distributionStrategy={distributionStrategy}
        distributionDelay={distributionDelay}
        count={transferNodes.length}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Dialog
        size="large"
        open={open}
        onChange={(isOpen) => {
          setOpen(isOpen);
        }}
        title={
          DispatchMetricLabels[
            transferNodes[0].transfer.kind.dispatchStrategy.dispatchMetric
          ]
        }
      >
        <div
          data-card-from-group
          className={classNames(
            'pt-4',

            'grid gap-x-8 gap-y-10 h-fit grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(335px,_1fr))]'
          )}
        >
          {transferNodes.map((n, i) => (
            <ActiveRewardCard
              key={i}
              transferNode={n}
              currentEpoch={currentEpoch}
              requirements={requirements}
            />
          ))}
        </div>
      </Dialog>
    </>
  );
};

export const ActiveRewardCard = ({
  transferNode,
  currentEpoch,
  requirements,
}: {
  transferNode: EnrichedRewardTransfer<
    DispatchStrategy | StakingDispatchStrategy
  >;
  currentEpoch: number;
  requirements?: Requirements;
}) => {
  const startsIn = transferNode.transfer.kind.startEpoch - currentEpoch;
  const endsIn =
    transferNode.transfer.kind.endEpoch != null
      ? transferNode.transfer.kind.endEpoch - currentEpoch
      : undefined;

  const dispatchStrategy = transferNode.transfer.kind.dispatchStrategy;

  let colour = DispatchMetricColourMap[dispatchStrategy.dispatchMetric];

  /**
   * Display the card as grey if any of the condition is `true`:
   *
   * - all markets scoped to the reward are settled
   * - all markets scoped to the reward are suspended
   * - the reward's asset is not actively traded on any of the active markets
   * - it start in the future
   *
   */
  if (
    areAllMarketsSettled(transferNode) ||
    areAllMarketsSuspended(transferNode) ||
    !transferNode.isAssetTraded ||
    startsIn > 0
  ) {
    colour = CardColour.GREY;
  }

  return (
    <RewardCard
      colour={colour}
      rewardAmount={addDecimalsFormatNumber(
        transferNode.transfer.amount,
        transferNode.transfer.asset?.decimals || 0,
        6
      )}
      dispatchAsset={transferNode.dispatchAsset}
      transferAsset={transferNode.transfer.asset || undefined}
      startsIn={startsIn > 0 ? startsIn : undefined}
      endsIn={endsIn}
      dispatchStrategy={dispatchStrategy}
      dispatchMetricInfo={<DispatchMetricInfo reward={transferNode} />}
      requirements={requirements}
      gameId={transferNode.transfer.gameId}
    />
  );
};

export const LinkToGame = ({
  reward,
  children,
}: {
  reward: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
  children: ReactNode;
}) => {
  const gameId = reward.transfer.gameId;
  const scoped = isScopedToTeams(reward);
  if (scoped && gameId && gameId.length > 0) {
    return <Link to={Links.COMPETITIONS_GAME(gameId)}>{children}</Link>;
  }
  return children;
};

const DistributionDelay = ({ value = 0 }: { value?: number | string }) => {
  const t = useT();
  return (
    <div className="flex flex-col gap-2 items-center text-center">
      <CardIcon
        iconName={VegaIconNames.LOCK}
        tooltip={t(
          // 'Number of epochs after distribution to delay vesting of rewards by'
          'After rewards are distributed, they will be vested after this number of epochs has passed.'
        )}
      />
      <span
        className="text-muted text-xs whitespace-nowrap"
        data-testid="locked-for"
      >
        {typeof value === 'number'
          ? t('numberEpochs', '{{count}} epochs', {
              count: value,
            })
          : t('numberEpochs', '{{count}} epochs', {
              replace: {
                count: value,
              },
            })}
      </span>
    </div>
  );
};
