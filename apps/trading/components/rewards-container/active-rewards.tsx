import { useActiveRewardsQuery } from './__generated__/Rewards';
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
  DistributionStrategyDescriptionMapping,
  DistributionStrategyMapping,
  EntityScope,
  EntityScopeMapping,
  type Maybe,
  type Transfer,
  type TransferNode,
  TransferStatus,
  TransferStatusMapping,
  DispatchMetric,
  DispatchMetricDescription,
  DispatchMetricLabels,
} from '@vegaprotocol/types';

export const ActiveRewards = ({ currentEpoch }: { currentEpoch: number }) => {
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
        return (
          node && (
            <ActiveRewardCard
              key={i}
              transferNode={node}
              currentEpoch={currentEpoch}
            />
          )
        );
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

export const ActiveRewardCard = ({
  transferNode,
  currentEpoch,
}: {
  transferNode: TransferNode;
  currentEpoch: number;
}) => {
  const t = useT();

  const { transfer } = transferNode;
  if (transfer.kind.__typename !== 'RecurringTransfer') {
    return null;
  }
  const { dispatchStrategy } = transfer.kind;

  if (!dispatchStrategy) {
    return null;
  }

  if (transfer.kind.endEpoch && transfer.kind.endEpoch < currentEpoch) {
    return null;
  }

  const { gradientClassName, mainClassName } = getGradientClasses(
    dispatchStrategy.dispatchMetric
  );

  const entityScope = dispatchStrategy.entityScope;

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
              {
                <Tooltip
                  description={t(
                    DistributionStrategyDescriptionMapping[
                      dispatchStrategy.distributionStrategy
                    ]
                  )}
                  underline={true}
                >
                  <span className="text-xs">
                    {
                      DistributionStrategyMapping[
                        dispatchStrategy.distributionStrategy
                      ]
                    }
                  </span>
                </Tooltip>
              }
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
            {DispatchMetricLabels[dispatchStrategy.dispatchMetric]} •{' '}
            {transfer.asset?.symbol} • {transfer.asset?.name}
          </span>

          <div className="flex items-center gap-8 flex-wrap">
            {
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Ends in')}</span>
                <span>
                  {t('{{epochs}} epochs', {
                    epochs: transfer.kind.endEpoch
                      ? transfer.kind.endEpoch - currentEpoch
                      : '-',
                  })}
                </span>
              </span>
            }

            {
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Assessed over')}</span>
                <span>
                  {t('{{epochs}} epochs', {
                    epochs: transfer.kind.dispatchStrategy?.windowLength,
                  })}
                </span>
              </span>
            }
          </div>

          {dispatchStrategy?.dispatchMetric && (
            <span className="text-muted text-sm">
              {t(DispatchMetricDescription[dispatchStrategy?.dispatchMetric])}
            </span>
          )}

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
                {t('Stake required')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  transfer.kind.dispatchStrategy?.stakingRequirement || 0,
                  transfer.asset?.decimals || 0
                )}{' '}
                {transfer.asset?.symbol}
                {/* <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                /> */}
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {t('Notional TWAP Requirement')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  transfer.kind.dispatchStrategy
                    ?.notionalTimeWeightedAveragePositionRequirement || 0,
                  transfer.asset?.decimals || 0
                )}{' '}
                {transfer.asset?.symbol}
                {/* <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                /> */}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getGradientClasses = (d: DispatchMetric | undefined) => {
  switch (d) {
    case DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION:
      return {
        gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
        mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_LP_FEES_RECEIVED:
      return {
        gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
        mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_MAKER_FEES_PAID:
      return {
        gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
        mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_MARKET_VALUE:
      return {
        gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
        mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_RELATIVE_RETURN:
    case DispatchMetric.DISPATCH_METRIC_RETURN_VOLATILITY:
      return {
        gradientClassName: 'from-vega-blue-500 to-vega-green-400',
        mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_VALIDATOR_RANKING:
    default:
      return {
        gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
        mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
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
