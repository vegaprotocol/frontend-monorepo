import { useT } from '../../lib/use-t';
import { addDecimalsFormatNumber, formatNumber } from '@vegaprotocol/utils';
import classNames from 'classnames';
import {
  type VegaIconSize,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
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
  AccountType,
  DistributionStrategy,
  IndividualScope,
  type Asset,
  type Team,
  IndividualScopeMapping,
} from '@vegaprotocol/types';
import { type ReactNode } from 'react';
import { type BasicAssetDetails } from '@vegaprotocol/assets';
import { type EnrichedRewardTransfer } from '../../lib/hooks/use-rewards';
import compact from 'lodash/compact';
import BigNumber from 'bignumber.js';
import { useTWAPQuery } from '../../lib/hooks/__generated__/Rewards';

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

const RewardCard = ({
  colour,
  rewardAmount,
  rewardAsset,
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
  rewardAsset?: BasicAssetDetails;
  /** The VEGA asset details, required to format the min staking amount. */
  transferAsset?: Asset | undefined;
  /** The VEGA asset details, required to format the min staking amount. */
  vegaAsset?: BasicAssetDetails;
  /** The transfer's dispatch strategy. */
  dispatchStrategy: DispatchStrategy;
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
    <div>
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
          <div className="flex justify-between gap-4">
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
                description={t(
                  DistributionStrategyDescriptionMapping[
                    dispatchStrategy.distributionStrategy
                  ]
                )}
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
            <div className="flex flex-col gap-2 items-center text-center">
              <CardIcon
                iconName={VegaIconNames.LOCK}
                tooltip={t(
                  'Number of epochs after distribution to delay vesting of rewards by'
                )}
              />
              <span
                className="text-muted text-xs whitespace-nowrap"
                data-testid="locked-for"
              >
                {t('numberEpochs', '{{count}} epochs', {
                  count: dispatchStrategy.lockPeriod,
                })}
              </span>
            </div>
          </div>

          <span className="border-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500" />
          {/** DISPATCH METRIC */}
          {dispatchMetricInfo ? (
            dispatchMetricInfo
          ) : (
            <span data-testid="dispatch-metric-info">
              {DispatchMetricLabels[dispatchStrategy.dispatchMetric]}
            </span>
          )}

          <div className="flex items-center gap-8 flex-wrap">
            {/** ENDS IN or STARTS IN */}
            {startsIn ? (
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Starts in')} </span>
                <span data-testid="starts-in" data-startsin={startsIn}>
                  {t('numberEpochs', '{{count}} epochs', {
                    count: endsIn,
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
            <p className="text-muted text-sm h-16">
              {t(DispatchMetricDescription[dispatchStrategy?.dispatchMetric])}
            </p>
          )}
          <span className="border-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500" />
          {/** REQUIREMENTS */}
          {dispatchStrategy && (
            <RewardRequirements
              dispatchStrategy={dispatchStrategy}
              rewardAsset={rewardAsset}
              vegaAsset={vegaAsset}
              requirements={requirements}
              gameId={gameId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const StakingRewardCard = ({
  colour,
  rewardAmount,
  rewardAsset,
  startsIn,
  endsIn,
  requirements,
  gameId,
}: {
  colour: CardColour;
  rewardAmount: string;
  /** The asset linked to the dispatch strategy via `dispatchMetricAssetId` property. */
  rewardAsset?: Asset;
  /** The number of epochs until the transfer starts. */
  startsIn?: number;
  /** The number of epochs until the transfer stops. */
  endsIn?: number;
  /** The VEGA asset details, required to format the min staking amount. */
  vegaAsset?: BasicAssetDetails;
  /** Eligibility requirements for rewards */
  requirements?: Requirements;
  /** The game id of the transfer */
  gameId?: string | null;
}) => {
  const t = useT();
  const stakeAvailable = requirements?.stakeAvailable;
  const tickOrCross = requirements ? (
    stakeAvailable && stakeAvailable > 1 ? (
      <Tick />
    ) : (
      <Cross />
    )
  ) : null;
  return (
    <div>
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
          <div className="flex justify-between gap-4">
            {/** ENTITY SCOPE */}
            <div className="flex flex-col gap-2 items-center text-center">
              <EntityIcon entityScope={EntityScope.ENTITY_SCOPE_INDIVIDUALS} />
              {
                <span className="text-muted text-xs" data-testid="entity-scope">
                  {EntityScopeLabelMapping[
                    EntityScope.ENTITY_SCOPE_INDIVIDUALS
                  ] || t('Unspecified')}
                </span>
              }
            </div>

            {/** AMOUNT AND DISTRIBUTION STRATEGY */}
            <div className="flex flex-col gap-2 items-center text-center">
              {/** AMOUNT */}
              <h3 className="flex flex-col gap-1 text-2xl shrink-1 text-center">
                <span className="font-glitch" data-testid="reward-value">
                  {rewardAmount}
                </span>

                <span className="font-alpha">{rewardAsset?.symbol || ''}</span>
              </h3>

              {/** DISTRIBUTION STRATEGY */}
              <Tooltip
                description={t(
                  DistributionStrategyDescriptionMapping[
                    DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA
                  ]
                )}
                underline={true}
              >
                <span className="text-xs" data-testid="distribution-strategy">
                  {
                    DistributionStrategyMapping[
                      DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA
                    ]
                  }
                </span>
              </Tooltip>
            </div>

            {/** DISTRIBUTION DELAY */}
            <div className="flex flex-col gap-2 items-center text-center">
              <CardIcon
                iconName={VegaIconNames.LOCK}
                tooltip={t(
                  'Number of epochs after distribution to delay vesting of rewards by'
                )}
              />
              <span
                className="text-muted text-xs whitespace-nowrap"
                data-testid="locked-for"
              >
                {t('numberEpochs', '{{count}} epochs', {
                  count: 0,
                })}
              </span>
            </div>
          </div>

          <span className="border-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500" />
          {/** DISPATCH METRIC */}
          {
            <span data-testid="dispatch-metric-info">
              {t('Staking rewards')}
            </span>
          }
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
                  count: 1,
                })}
              </span>
            </span>
          </div>
          {/** DISPATCH METRIC DESCRIPTION */}
          {
            <p className="text-muted text-sm h-16">
              {t(
                'Global staking reward for staking $VEGA on the network via the Governance app'
              )}
            </p>
          }
          <span className="border-[0.5px] dark:border-vega-cdark-500 border-vega-clight-500" />
          {/** REQUIREMENTS */}
          <dl className="flex justify-between flex-wrap items-center gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1 text-muted">
                {t('Team scope')}
              </dt>
              <dd className="flex items-center gap-1" data-testid="scope">
                <Tooltip
                  description={
                    IndividualScopeDescriptionMapping[
                      IndividualScope.INDIVIDUAL_SCOPE_ALL
                    ]
                  }
                >
                  <span>
                    {tickOrCross} {t('Individual')}
                  </span>
                </Tooltip>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1 text-muted">
                {t('Staked VEGA')}
              </dt>
              <dd
                className="flex items-center gap-1"
                data-testid="staking-requirement"
              >
                {stakeAvailable ? (
                  stakeAvailable > 1 ? (
                    <Tick />
                  ) : (
                    <Cross />
                  )
                ) : undefined}
                {stakeAvailable
                  ? addDecimalsFormatNumber(
                      stakeAvailable?.toString() || '0',
                      18, // vega asset decimals
                      6
                    )
                  : '1.00'}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1 text-muted">
                {t('Average position')}
              </dt>
              <dd
                className="flex items-center gap-1"
                data-testid="average-position"
              >
                {' '}
                {tickOrCross}
                {formatNumber(0, 2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const DispatchMetricInfo = ({
  reward,
}: {
  reward: EnrichedRewardTransfer;
}) => {
  const t = useT();
  const dispatchStrategy = reward.transfer.kind.dispatchStrategy;
  const marketNames = compact(
    reward.markets?.map((m) => m.tradableInstrument.instrument.name)
  );

  let additionalDispatchMetricInfo = null;

  // if asset found then display asset symbol
  if (reward.dispatchAsset) {
    additionalDispatchMetricInfo = <span>{reward.dispatchAsset.symbol}</span>;
  }
  // but if scoped to only one market then display market name
  if (marketNames.length === 1) {
    additionalDispatchMetricInfo = <span>{marketNames[0]}</span>;
  }
  // or if scoped to many markets then indicate it's scoped to "specific markets"
  if (marketNames.length > 1) {
    additionalDispatchMetricInfo = (
      <Tooltip description={marketNames.join(', ')}>
        <span>{t('Specific markets')}</span>
      </Tooltip>
    );
  }

  return (
    <span data-testid="dispatch-metric-info" className="h-12">
      {DispatchMetricLabels[dispatchStrategy.dispatchMetric]}
      {additionalDispatchMetricInfo != null && (
        <> • {additionalDispatchMetricInfo}</>
      )}
    </span>
  );
};

const RewardRequirements = ({
  dispatchStrategy,
  rewardAsset,
  vegaAsset,
  requirements,
  gameId,
}: {
  dispatchStrategy: DispatchStrategy;
  rewardAsset?: BasicAssetDetails;
  vegaAsset?: BasicAssetDetails;
  requirements?: Requirements;
  gameId?: string | null;
}) => {
  const t = useT();

  const entityLabel = EntityScopeLabelMapping[dispatchStrategy.entityScope];

  const stakingRequirement = dispatchStrategy.stakingRequirement;
  const stakeAvailable = requirements?.stakeAvailable;
  const averagePositionRequirements =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  const { data: twap } = useTWAPQuery({
    variables: {
      gameId: gameId || '',
      partyId: requirements?.pubKey || '',
      assetId: rewardAsset?.id || '',
    },
    skip: !requirements,
  });
  const averagePosition =
    twap?.timeWeightedNotionalPosition?.timeWeightedNotionalPosition;

  const averagePositionFormatted =
    averagePosition &&
    addDecimalsFormatNumber(averagePosition, rewardAsset?.decimals || 0);

  const averagePositionRequirementsFormatted =
    averagePositionRequirements &&
    addDecimalsFormatNumber(
      averagePositionRequirements,
      rewardAsset?.decimals || 0
    );

  return (
    <dl className="flex justify-between flex-wrap items-center gap-3 text-xs">
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

      <div className="flex flex-col gap-1">
        <dt className="flex items-center gap-1 text-muted">
          {t('Average position')}
        </dt>
        <Tooltip
          description={
            averagePosition
              ? t(
                  'Your average position is {{averagePosition}}, but the requirement is {{averagePositionRequirements}}',
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
              averagePositionRequirements &&
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
  dispatchStrategy: DispatchStrategy;
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
  { gradientClassName: string; mainClassName: string }
> = {
  [CardColour.BLUE]: {
    gradientClassName: 'from-vega-blue-500 to-vega-green-400',
    mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
  },
  [CardColour.GREEN]: {
    gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
    mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
  },
  [CardColour.GREY]: {
    gradientClassName: 'from-vega-cdark-500 to-vega-clight-200',
    mainClassName: 'from-vega-cdark-400 dark:from-vega-cdark-600 to-20%',
  },
  [CardColour.ORANGE]: {
    gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
    mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
  },
  [CardColour.PINK]: {
    gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
    mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
  },
  [CardColour.PURPLE]: {
    gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
    mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
  },
  [CardColour.WHITE]: {
    gradientClassName:
      'from-vega-clight-600 dark:from-vega-clight-900 to-vega-yellow-500 dark:to-vega-yellow-400',
    mainClassName: 'from-white dark:from-vega-clight-100 to-20%',
  },
  [CardColour.YELLOW]: {
    gradientClassName: 'from-vega-yellow-500 to-vega-orange-400',
    mainClassName: 'from-vega-yellow-400 dark:from-vega-yellow-600 to-20%',
  },
};

const DispatchMetricColourMap: Record<DispatchMetric, CardColour> = {
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

export const ActiveRewardCard = ({
  transferNode,
  currentEpoch,
  requirements,
}: {
  transferNode: EnrichedRewardTransfer;
  currentEpoch: number;
  requirements?: Requirements;
}) => {
  // don't display the cards that are scoped to not trading markets
  const marketSettled = transferNode.markets?.filter(
    (m) =>
      m?.state &&
      [
        MarketState.STATE_TRADING_TERMINATED,
        MarketState.STATE_SETTLED,
        MarketState.STATE_CANCELLED,
        MarketState.STATE_CLOSED,
      ].includes(m.state)
  );

  const startsIn = transferNode.transfer.kind.startEpoch - currentEpoch;
  const endsIn =
    transferNode.transfer.kind.endEpoch != null
      ? transferNode.transfer.kind.endEpoch - currentEpoch
      : undefined;

  // hide the card if all of the markets are being marked as e.g. settled
  if (
    marketSettled?.length === transferNode.markets?.length &&
    Boolean(transferNode.markets && transferNode.markets.length > 0)
  ) {
    return null;
  }

  if (
    !transferNode.transfer.kind.dispatchStrategy &&
    transferNode.transfer.toAccountType ===
      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD
  ) {
    return (
      <StakingRewardCard
        colour={CardColour.WHITE}
        rewardAmount={addDecimalsFormatNumber(
          transferNode.transfer.amount,
          transferNode.transfer.asset?.decimals || 0,
          6
        )}
        rewardAsset={transferNode.transfer.asset || undefined}
        startsIn={startsIn > 0 ? startsIn : undefined}
        endsIn={endsIn}
        requirements={requirements}
        gameId={transferNode.transfer.gameId}
      />
    );
  }

  let colour =
    DispatchMetricColourMap[
      transferNode.transfer.kind.dispatchStrategy.dispatchMetric
    ];

  // grey out of any of the markets is suspended or
  // if the asset is not currently traded on any of the active markets
  const marketSuspended =
    transferNode.markets?.filter(
      (m) =>
        m?.state === MarketState.STATE_SUSPENDED ||
        m?.state === MarketState.STATE_SUSPENDED_VIA_GOVERNANCE
    ).length === transferNode.markets?.length &&
    Boolean(transferNode.markets && transferNode.markets.length > 0);

  if (marketSuspended || !transferNode.isAssetTraded || startsIn > 0) {
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
      rewardAsset={transferNode.dispatchAsset}
      transferAsset={transferNode.transfer.asset || undefined}
      startsIn={startsIn > 0 ? startsIn : undefined}
      endsIn={endsIn}
      dispatchStrategy={transferNode.transfer.kind.dispatchStrategy}
      dispatchMetricInfo={<DispatchMetricInfo reward={transferNode} />}
      requirements={requirements}
      gameId={transferNode.transfer.gameId}
    />
  );
};
