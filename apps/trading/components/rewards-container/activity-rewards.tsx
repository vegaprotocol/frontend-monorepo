import {
  useActiveRewardsQuery,
  useActivityStreakQuery,
} from './__generated__/Rewards';
import { useReferralProgram } from '../../client-pages/referrals/hooks/use-referral-program';
import { useT } from '../../lib/use-t';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import classNames from 'classnames';
import {
  Icon,
  type IconName,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  type VegaIconSize,
} from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';
import {
  AccountType,
  AccountTypeDescriptionMapping,
  AccountTypeMapping,
  DistributionStrategyDescriptionMapping,
  DistributionStrategyMapping,
  EntityScope,
  EntityScopeMapping,
  type Maybe,
  type Transfer,
  type TransferNode,
  TransferStatus,
  TransferStatusMapping,
} from '@vegaprotocol/types';

export const ActiveRewards = () => {
  const { data: activeRewardsData } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
  });

  const transfers = activeRewardsData?.transfersConnection?.edges
    ?.map((e) => e?.node as TransferNode)
    .filter((node) => node.transfer.reference === 'reward');

  if (!transfers) return null;

  return (
    <div className="grid gap-x-8 gap-y-10 h-fit grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(343px,_1fr))]">
      {transfers.map((node, i) => {
        return node && <ActiveRewardCard key={i} transferNode={node} />;
      })}
    </div>
  );
};

const StatusIndicator = ({
  status,
  reason,
}: {
  status: TransferStatus;
  reason?: Maybe<string> | undefined;
}) => {
  const t = useT();
  const getIconIntent = (status: string) => {
    switch (status) {
      case TransferStatus.STATUS_DONE:
        return { icon: IconNames.TICK_CIRCLE, intent: Intent.Success };
      case TransferStatus.STATUS_CANCELLED:
        return { icon: IconNames.MOON, intent: Intent.None };
      case TransferStatus.STATUS_PENDING:
        return { icon: IconNames.HELP, intent: Intent.Primary };
      case TransferStatus.STATUS_REJECTED:
        return { icon: IconNames.ERROR, intent: Intent.Danger };
      case TransferStatus.STATUS_STOPPED:
        return { icon: IconNames.ERROR, intent: Intent.Danger };
      default:
        return { icon: IconNames.HELP, intent: Intent.Primary };
    }
  };
  const { icon, intent } = getIconIntent(status);
  return (
    <Tooltip
      description={
        <span>
          {t('Transfer status: {{status}} {{reason}}', {
            status: TransferStatusMapping[status],
            reason: reason ? `(${reason})` : '',
          })}
        </span>
      }
    >
      <span
        className={classNames(
          {
            'text-gray-700 dark:text-gray-300': intent === Intent.None,
            'text-vega-blue': intent === Intent.Primary,
            'text-vega-green dark:text-vega-green': intent === Intent.Success,
            'dark:text-yellow text-yellow-600': intent === Intent.Warning,
            'text-vega-red': intent === Intent.Danger,
          },
          'flex items-start p-1 align-text-bottom'
        )}
      >
        <Icon size={3} name={icon as IconName} />
      </span>
    </Tooltip>
  );
};

export const ActivityStreaks = ({
  pubKey,
  epoch,
}: {
  pubKey: string | null;
  epoch: number;
}) => {
  const { data } = useActivityStreakQuery({
    variables: {
      partyId: pubKey || '',
    },
  });
  const { benefitTiers } = useReferralProgram();

  const streaks = data?.partiesConnection?.edges?.map(
    (edge) => edge?.node?.activityStreak
  );

  return streaks?.map((streak, i) => (
    <ActivityStreak benefitTiers={benefitTiers} streak={streak} key={i} />
  ));
};

export const ActiveRewardCard = ({
  transferNode,
}: {
  transferNode: TransferNode;
}) => {
  const t = useT();

  const { transfer } = transferNode;
  if (transfer.kind.__typename !== 'RecurringTransfer') {
    return null;
  }

  const { gradientClassName, mainClassName } = getGradientClasses(
    transfer.toAccountType
  );

  const entityScope = transfer.kind.dispatchStrategy?.entityScope;

  return (
    <div>
      <div
        className={classNames(
          'bg-gradient-to-r col-span-full p-0.5 lg:col-auto h-full',
          'rounded-lg',
          gradientClassName
        )}
      >
        <div
          className={classNames(
            mainClassName,
            'bg-gradient-to-b bg-vega-clight-800 dark:bg-vega-cdark-800 h-full w-full rounded p-4 flex flex-col gap-4'
          )}
        >
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <EntityIcon transfer={transfer} />
              {entityScope && (
                <span className="text-muted text-xs">
                  {entityScope === EntityScope.ENTITY_SCOPE_TEAMS
                    ? t('Team')
                    : entityScope === EntityScope.ENTITY_SCOPE_INDIVIDUALS
                    ? t('Individual')
                    : t('Unspecified')}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 items-center text-center">
              <span className="flex flex-col gap-1 font-alpha calt text-2xl shrink-1 text-center">
                <span>
                  {addDecimalsFormatNumber(
                    transferNode.transfer.amount,
                    transferNode.transfer.asset?.decimals || 0,
                    6
                  )}
                </span>

                <span>{transferNode.transfer.asset?.symbol}</span>
              </span>
              {transfer.kind.dispatchStrategy?.distributionStrategy && (
                <Tooltip
                  description={t(
                    DistributionStrategyDescriptionMapping[
                      transfer.kind.dispatchStrategy?.distributionStrategy
                    ]
                  )}
                  underline={true}
                >
                  <span className="text-xs">
                    {
                      DistributionStrategyMapping[
                        transfer.kind.dispatchStrategy?.distributionStrategy
                      ]
                    }
                  </span>
                </Tooltip>
              )}
            </div>

            <div className="flex flex-col gap-2 items-center text-center">
              <CardIcon
                iconName={VegaIconNames.LOCK}
                tooltip={t(
                  'Number of epochs after distribution to delay vesting of rewards by.'
                )}
              />
              <span className="text-muted text-xs whitespace-nowrap">
                {t('{{lock}} epochs', {
                  lock: transfer.kind.dispatchStrategy?.lockPeriod,
                })}
              </span>
            </div>
          </div>

          <span className="border-[0.5px] border-gray-700" />

          <span>
            {AccountTypeMapping[transfer.toAccountType]} •{' '}
            {transfer.asset?.symbol} • {transfer.asset?.name}
          </span>

          <div className="flex items-center gap-8 flex-wrap">
            {
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Ends in')}</span>
                <span>
                  {t('{{epochs}} epochs', {
                    epochs: transfer.kind.endEpoch
                      ? transfer.kind.endEpoch - transfer.kind.startEpoch
                      : '-',
                  })}
                </span>
              </span>
            }

            {
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Assessed over')}</span>
                {/* TODO what is assessed over? */}
                <span>
                  {t('{{epochs}} epochs', {
                    epochs: transfer.kind.endEpoch
                      ? transfer.kind.endEpoch - transfer.kind.startEpoch
                      : '-',
                  })}
                </span>
              </span>
            }
          </div>

          <span className="text-muted text-sm">
            {/* TODO get card description from transfer.toAccountType */}
            {t(AccountTypeDescriptionMapping[transfer.toAccountType])}
          </span>

          <span className="border-[0.5px] border-gray-700" />

          <div className="flex justify-between flex-wrap items-center gap-3 text-xs">
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {t('Entity scope')}{' '}
              </span>

              <span className="flex items-center gap-1">
                {transfer.kind.dispatchStrategy?.teamScope && (
                  <Tooltip
                    description={
                      <span>{transfer.kind.dispatchStrategy?.teamScope}</span>
                    }
                  >
                    <span className="flex items-center p-1 rounded-full border border-gray-600">
                      {<VegaIcon name={VegaIconNames.TEAM} size={16} />}
                    </span>
                  </Tooltip>
                )}
                {transfer.kind.dispatchStrategy?.individualScope && (
                  <Tooltip
                    description={
                      <span>
                        {transfer.kind.dispatchStrategy?.individualScope}
                      </span>
                    }
                  >
                    <span className="flex items-center p-1 rounded-full border border-gray-600">
                      {<VegaIcon name={VegaIconNames.MAN} size={16} />}
                    </span>
                  </Tooltip>
                )}
                <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                />
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {/* TODO what is staking requirement? Amount staked or staking requirement */}
                {t('Amount staked')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  transfer.kind.dispatchStrategy?.stakingRequirement || 0,
                  transfer.asset?.decimals || 0
                )}{' '}
                {transfer.asset?.symbol}
                <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                />
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {t('Average position')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  transfer.kind.dispatchStrategy
                    ?.notionalTimeWeightedAveragePositionRequirement || 0,
                  transfer.asset?.decimals || 0
                )}{' '}
                {transfer.asset?.symbol}
                <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getGradientClasses = (to: AccountType) => {
  switch (to) {
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES:
      return {
        gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
        mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES:
      return {
        gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
        mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES:
      return {
        gradientClassName: 'from-vega-blue-500 to-vega-green-400',
        mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS:
      return {
        gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
        mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION:
      return {
        gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
        mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN:
      return {
        gradientClassName: 'from-vega-pink-500 to-vega-yellow-500',
        mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
      };
    // again, this is a duplicate
    case AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY:
      return {
        gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
        mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING:
      return {
        gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
        mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_VESTED_REWARDS:
      return {
        gradientClassName: 'from-vega-blue-500 to-vega-green-400',
        mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
      };
    case AccountType.ACCOUNT_TYPE_VESTING_REWARDS:
      return {
        gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
        mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
      };
    default:
      return {
        gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
        mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
      };
  }
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

const EntityIcon = ({
  transfer,
  size = 18,
}: {
  transfer: Transfer;
  size?: VegaIconSize;
}) => {
  if (transfer.kind.__typename !== 'RecurringTransfer') {
    return null;
  }
  const entityScope = transfer.kind.dispatchStrategy?.entityScope;
  const getIconName = () => {
    switch (entityScope) {
      case EntityScope.ENTITY_SCOPE_TEAMS:
        return VegaIconNames.TEAM;
      case EntityScope.ENTITY_SCOPE_INDIVIDUALS:
        return VegaIconNames.MAN;
      default:
        return VegaIconNames.QUESTION_MARK;
    }
  };
  const iconName = getIconName();
  return (
    <Tooltip
      description={
        <span>{entityScope ? EntityScopeMapping[entityScope] : ''}</span>
      }
    >
      <span className="flex items-center p-2 rounded-full border border-gray-600">
        {iconName && <VegaIcon name={iconName} size={size} />}
      </span>
    </Tooltip>
  );
};

export const ActivityStreak = ({
  benefitTiers,
  streak,
}: {
  benefitTiers:
    | never[]
    | {
        tier: number;
        rewardFactor: number;
        commission: string;
        discountFactor: number;
        discount: string;
        minimumVolume: number;
        volume: string;
        epochs: number;
      }[];
  streak:
    | (
        | {
            __typename?: 'PartyActivityStreak' | undefined;
            activeFor: number;
            isActive: boolean;
            inactiveFor: number;
            rewardDistributionMultiplier: string;
            rewardVestingMultiplier: string;
            epoch: number;
            tradedVolume: string;
            openVolume: string;
          }
        | null
        | undefined
      )
    | undefined;
}) => {
  const t = useT();
  const progress = 30;
  const total = 100;

  const safeProgress = () => {
    return (progress / total) * 100;
  };

  const progressBarHeight = 'h-10';

  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-col gap-1">
          <div
            className="grid"
            style={{
              gridTemplateColumns:
                'repeat(' + benefitTiers.length + ', minmax(0, 1fr))',
            }}
          >
            {benefitTiers.map((tier, index) => {
              return (
                <div key={index} className="flex justify-end -mr-10">
                  <span className="flex flex-col items-center gap-1">
                    <span className="flex flex-col items-center font-medium">
                      <span className="text-sm">
                        {t('Tier {{tier}}', {
                          tier: tier.tier,
                        })}
                      </span>
                      <span className="text-muted text-xs">
                        {t('{{epochs}} epochs', {
                          epochs: tier.epochs,
                        })}
                      </span>
                    </span>

                    <span
                      className={classNames(
                        'text-xs flex flex-col items-center justify-center px-2 py-1 rounded-lg text-white border',
                        {
                          'border-pink-600 bg-pink-900': tier.tier === 1,
                          'border-purple-600 bg-purple-900': tier.tier === 2,
                          'border-blue-600 bg-blue-900': tier.tier === 3,
                        }
                      )}
                    >
                      <span>
                        {t('Reward {{reward}}x', {
                          reward: tier.rewardFactor || '1.5',
                        })}
                      </span>
                      <span>
                        {t('Vesting {{vesting}}x', {
                          vesting: '1.5',
                        })}
                      </span>
                    </span>

                    <span
                      className={classNames(
                        {
                          'text-pink-500': tier.tier === 1,
                          'text-purple-500': tier.tier === 2,
                          'text-blue-500': tier.tier === 3,
                        },
                        'text-xl'
                      )}
                    >
                      •
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {benefitTiers.map((tier, index) => {
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-card rounded-[100px] grow"
              >
                <div
                  className={classNames(
                    'relative w-full rounded-[100px] bg-gray-200 dark:bg-gray-800',
                    progressBarHeight
                  )}
                >
                  <div
                    className={classNames(
                      'absolute left-0 top-0 h-full rounded-[100px] bg-gradient-to-r',
                      {
                        'from-vega-pink-600 to-vega-pink-500': tier.tier === 1,
                        'from-vega-purple-600 to-vega-purple-500':
                          tier.tier === 2,
                        'from-vega-blue-600 to-vega-blue-500': tier.tier === 3,
                      }
                    )}
                    style={{ width: safeProgress() + '%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <VegaIcon name={VegaIconNames.STREAK} />

          <span className="flex flex-col text-xs">
            <span>
              {t('{{epochs}} epochs streak', {
                // TODO here ir needs to be the current streak
                epochs: streak?.activeFor,
              })}
            </span>
            <span>
              <span className="text-vega-pink-500">3 days</span>
              &nbsp;to Tier 1{' '}
            </span>
          </span>
        </div>
      </div>
      {/* <div>{JSON.stringify(stakingTiers)}</div>
      <div>{JSON.stringify(details)}</div> */}
      {/* <div>{JSON.stringify(benefitTiers)}</div> */}
      {/* <div>{JSON.stringify(streak)}</div> */}
    </>
  );
};
