import { useT } from '../../lib/use-t';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import { cn } from '@vegaprotocol/ui-toolkit';
import {
  type VegaIconSize,
  AnchorButton,
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
  IndividualScope,
  type Asset,
  type Team,
  IndividualScopeMapping,
  type StakingRewardMetric,
  type StakingDispatchStrategy,
  DistributionStrategy,
} from '@vegaprotocol/types';
import { type ReactNode } from 'react';
import {
  type AssetFieldsFragment,
  type BasicAssetDetails,
  AssetSymbol,
} from '@vegaprotocol/assets';
import {
  isScopedToTeams,
  type EnrichedRewardTransfer,
  areAllMarketsSettled,
} from '../../lib/hooks/use-rewards';
import compact from 'lodash/compact';
import BigNumber from 'bignumber.js';
import { useTWAPQuery } from '../../lib/hooks/__generated__/Rewards';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';
import flatten from 'lodash/flatten';
import sum from 'lodash/sum';

const Tick = () => (
  <VegaIcon name={VegaIconNames.TICK} size={12} className="text-green-500" />
);

const Cross = () => (
  <VegaIcon name={VegaIconNames.CROSS} size={12} className="text-red-500" />
);

/** Eligibility requirements for rewards */
export type Requirements = {
  isEligible: boolean;
  stakeAvailable?: bigint;
  team?: Partial<Team>;
  pubKey: string;
};

const GroupCard = ({
  dispatchStrategy,
  colour,
  rewardAmount,
  transferAsset,
  requirements,
  link,
}: {
  dispatchStrategy: DispatchStrategy | StakingDispatchStrategy;
  colour: CardColour;
  rewardAmount: string;
  transferAsset?: AssetFieldsFragment | undefined;
  requirements?: Requirements;
  link: string;
}) => {
  const t = useT();

  const entityScope = dispatchStrategy.entityScope;
  const distributionStrategy = dispatchStrategy.distributionStrategy;
  const dispatchMetric = dispatchStrategy.dispatchMetric;

  return (
    <div data-reward-card>
      <div
        className={cn(
          'bg-gradient-to-r col-span-full p-px lg:col-auto h-full',
          'rounded-lg',
          CardColourStyles[colour].gradientClassName
        )}
        data-testid="active-rewards-card"
      >
        <div
          className={cn(
            CardColourStyles[colour].mainClassName,
            'bg-gradient-to-b bg-surface-1  h-full w-full rounded-md p-4',
            'flex flex-col gap-4 justify-items-start'
          )}
        >
          <div
            className={cn(
              'flex justify-between gap-2',
              'pb-3 border-b-[0.5px]  border-gs-300 dark:border-gs-700'
            )}
          >
            {/** ENTITY SCOPE */}
            <div className="flex flex-col gap-2 items-center text-center">
              {entityScope && (
                <>
                  <EntityIcon entityScope={entityScope} />
                  <span
                    className="text-surface-1-fg-muted text-xs"
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
                  <span data-testid="reward-value">{rewardAmount}</span>
                </span>

                <span data-testid="reward-asset">
                  <AssetSymbol asset={transferAsset} />
                </span>
              </h3>
            </div>

            <div className="flex flex-col gap-2 items-center text-center">
              {distributionStrategy && (
                <>
                  <DistributionStrategyIcon strategy={distributionStrategy} />
                  <span
                    className="text-surface-1-fg-muted text-xs"
                    data-testid="distribution-strategy"
                  >
                    {DistributionStrategyMapping[distributionStrategy]}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={cn('flex flex-col gap-3 h-full')}>
            {/** DISPATCH METRIC */}
            <h4 data-testid="dispatch-metric-info" className="text-lg">
              {DispatchMetricLabels[dispatchMetric]}
            </h4>
            {/** DISPATCH METRIC DESCRIPTION */}
            <p className="text-surface-1-fg-muted">
              {t(DispatchMetricDescription[dispatchMetric])}
            </p>
          </div>
          <div>
            {/** REQUIREMENTS */}
            {dispatchStrategy && (
              <div className="pt-4 border-t border-gs-300 dark:border-gs-700">
                <RewardRequirements
                  dispatchStrategy={dispatchStrategy}
                  dispatchAsset={transferAsset}
                  requirements={requirements}
                />
              </div>
            )}
          </div>
          <div>
            <AnchorButton
              intent={null}
              className={cn(CardColourStyles[colour].btn, 'w-full')}
              href={link}
            >
              {t('View reward details')}
            </AnchorButton>
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
        className={cn(
          'bg-gradient-to-r col-span-full p-0.5 lg:col-auto h-full',
          'rounded-lg',
          CardColourStyles[colour].gradientClassName
        )}
        data-testid="active-rewards-card"
      >
        <div
          className={cn(
            CardColourStyles[colour].mainClassName,
            'bg-gradient-to-b bg-surface-2  h-full w-full rounded-md p-4 flex flex-col gap-4'
          )}
        >
          <div
            className={cn(
              'flex justify-between gap-4',
              'pb-4 border-b-[0.5px]  border-gs-300 dark:border-gs-700'
            )}
          >
            {/** ENTITY SCOPE */}
            <div className="flex flex-col gap-2 items-center text-center">
              <EntityIcon entityScope={dispatchStrategy.entityScope} />
              {dispatchStrategy.entityScope && (
                <span
                  className="text-surface-1-fg-muted text-xs"
                  data-testid="entity-scope"
                >
                  {EntityScopeLabelMapping[dispatchStrategy.entityScope] ||
                    t('Unspecified')}
                </span>
              )}
            </div>

            {/** AMOUNT AND DISTRIBUTION STRATEGY */}
            <div className="flex flex-col gap-2 items-center text-center">
              {/** AMOUNT */}
              <h3 className="flex flex-col gap-1 text-2xl shrink-1 text-center">
                <span data-testid="reward-value">{rewardAmount}</span>
                <span data-testid="reward-asset">
                  <AssetSymbol asset={transferAsset as AssetFieldsFragment} />
                </span>
              </h3>

              {/** DISTRIBUTION STRATEGY */}
              <span className="text-xs" data-testid="distribution-strategy">
                {
                  DistributionStrategyMapping[
                    dispatchStrategy.distributionStrategy
                  ]
                }
              </span>
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
                  <span className="text-surface-1-fg-muted text-xs">
                    {t('Starts in')}{' '}
                  </span>
                  <span data-testid="starts-in" data-startsin={startsIn}>
                    {t('numberEpochs', '{{count}} epochs', {
                      count: startsIn,
                    })}
                  </span>
                </span>
              ) : endsIn !== undefined ? (
                <span className="flex flex-col">
                  <span className="text-surface-1-fg-muted text-xs">
                    {t('Ends in')}{' '}
                  </span>
                  <span data-testid="ends-in" data-endsin={endsIn}>
                    {endsIn > 0
                      ? t('numberEpochs', '{{count}} epochs', {
                          count: endsIn,
                        })
                      : t('Ended')}
                  </span>
                </span>
              ) : null}
              {/** WINDOW LENGTH */}
              <span className="flex flex-col">
                <span className="text-surface-1-fg-muted text-xs">
                  {t('Assessed over')}
                </span>
                <span data-testid="assessed-over">
                  {t('numberEpochs', '{{count}} epochs', {
                    count: dispatchStrategy.windowLength,
                  })}
                </span>
              </span>
              {/** PAYS EVERY */}
              {dispatchStrategy.transferInterval && (
                <span className="flex flex-col">
                  <span className="text-surface-1-fg-muted text-xs">
                    {t('Pays every')}
                  </span>
                  <span data-testid="pays-every">
                    {t('numberEpochs', '{{count}} epochs', {
                      count: dispatchStrategy.transferInterval,
                    })}
                  </span>
                </span>
              )}
              {/** CAPPED AT */}
              {dispatchStrategy.capRewardFeeMultiple && (
                <span className="flex flex-col">
                  <span className="text-surface-1-fg-muted text-xs">
                    {t('Capped at')}
                  </span>
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
              <p className="text-surface-1-fg-muted text-sm">
                {t(DispatchMetricDescription[dispatchStrategy?.dispatchMetric])}
              </p>
            )}
          </div>

          {/** REQUIREMENTS */}
          {dispatchStrategy && (
            <div className="pt-4 border-t-[0.5px]  border-gs-300 dark:border-gs-700">
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
          <AssetSymbol asset={reward.dispatchAsset} />
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
        <dt className="flex items-center gap-1 text-surface-1-fg-muted">
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
        <dt className="flex items-center gap-1 text-surface-1-fg-muted">
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
        <dt className="flex items-center gap-1 text-surface-1-fg-muted">
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
    gradientClassName: 'from-blue-500 to-green-400',
    mainClassName: 'from-blue-400 dark:from-blue-600 to-20%',
    btn: '!bg-gradient-to-br from-blue-500 from-50% to-green-400 !text-white',
  },
  [CardColour.GREEN]: {
    gradientClassName: 'from-green-500 to-yellow-500',
    mainClassName: 'from-green-400 dark:from-green-600 to-20%',
    btn: '!bg-gradient-to-br from-green-500 from-50% to-yellow-400 !text-black',
  },
  [CardColour.GREY]: {
    gradientClassName: 'from-gs-500 to-gs-200',
    mainClassName: 'from-surface-1 to-20%',
    btn: '!bg-gradient-to-br from-50% to-gs-200 !text-white',
  },
  [CardColour.ORANGE]: {
    gradientClassName: 'from-orange-500 to-pink-400',
    mainClassName: 'from-orange-400 dark:from-orange-600 to-20%',
    btn: '!bg-gradient-to-br from-orange-500 from-50% to-pink-600 !text-black',
  },
  [CardColour.PINK]: {
    gradientClassName: 'from-pink-500 to-purple-400',
    mainClassName: 'from-pink-400 dark:from-pink-600 to-20%',
    btn: '!bg-gradient-to-br from-pink-500 from-50% to-purple-600 !text-white',
  },
  [CardColour.PURPLE]: {
    gradientClassName: 'from-purple-500 to-blue-400',
    mainClassName: 'from-purple-400 dark:from-purple-600 to-20%',
    btn: '!bg-gradient-to-br from-purple-500 from-50% to-blue-600 !text-white',
  },
  [CardColour.WHITE]: {
    gradientClassName:
      'from-gs-600 dark:from-gs-900 to-yellow-500 dark:to-yellow-400',
    mainClassName: 'from-white dark:from-gs-100 to-20%',
    btn: '!bg-gradient-to-br from-white from-50% to-yellow-500 !text-black',
  },
  [CardColour.YELLOW]: {
    gradientClassName: 'from-yellow-500 to-orange-400',
    mainClassName: 'from-yellow-400 dark:from-yellow-600 to-20%',
    btn: '!bg-gradient-to-br from-yellow-500 from-50% to-orange-400 !text-black',
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
  // Realised return
  [DispatchMetric.DISPATCH_METRIC_REALISED_RETURN]: CardColour.GREEN,
  STAKING_REWARD_METRIC: CardColour.WHITE,
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
      <span className="flex items-center p-2 rounded-full border border-gs-700 dark:border-gs-300">
        <VegaIcon name={iconName} size={size} />
      </span>
    </Tooltip>
  );
};

const EntityScopeIconMap: Record<EntityScope, VegaIconNames> = {
  [EntityScope.ENTITY_SCOPE_TEAMS]: VegaIconNames.TEAM,
  [EntityScope.ENTITY_SCOPE_INDIVIDUALS]: VegaIconNames.MAN,
};

const DistStrategyIconMap: Record<DistributionStrategy, VegaIconNames> = {
  [DistributionStrategy.DISTRIBUTION_STRATEGY_RANK]: VegaIconNames.MEDAL,
  [DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA]: VegaIconNames.CLOCK,
  [DistributionStrategy.DISTRIBUTION_STRATEGY_RANK_LOTTERY]: VegaIconNames.DICE,
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
      <span className="flex items-center p-2 rounded-full border border-gs-300">
        <VegaIcon
          name={EntityScopeIconMap[entityScope] || VegaIconNames.QUESTION_MARK}
          size={size}
        />
      </span>
    </Tooltip>
  );
};

const DistributionStrategyIcon = ({
  strategy,
  size = 18,
}: {
  strategy: DistributionStrategy;
  size?: VegaIconSize;
}) => {
  const t = useT();
  return (
    <Tooltip
      description={
        <div className="flex flex-col gap-4">
          <p>{t(DistributionStrategyDescriptionMapping[strategy])}.</p>
        </div>
      }
      underline={true}
    >
      <span className="flex items-center p-2 rounded-full border border-gs-300">
        <VegaIcon name={DistStrategyIconMap[strategy]} size={size} />
      </span>
    </Tooltip>
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
  const dispatchStrategy = transferNodes[0].transfer.kind.dispatchStrategy;

  if (!transferAsset) return null;

  const params = new URLSearchParams({
    asset: transferAsset.id,
    metric: dispatchStrategy.dispatchMetric,
    entityScope: dispatchStrategy.entityScope,
    distributionStrategy: dispatchStrategy.distributionStrategy,
    stakingRequirement: dispatchStrategy.stakingRequirement || '0',
  });

  const link = Links.REWARDS_DETAIL(params.toString());

  return (
    <GroupCard
      colour={colour}
      rewardAmount={rewardAmount}
      // TODO: fix the types for the useRewards hook. It just the full type, and not the type created by Rewards.graphql
      transferAsset={transferAsset as AssetFieldsFragment}
      requirements={requirements}
      dispatchStrategy={dispatchStrategy}
      link={link}
    />
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
        className="text-surface-1-fg-muted text-xs whitespace-nowrap"
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
