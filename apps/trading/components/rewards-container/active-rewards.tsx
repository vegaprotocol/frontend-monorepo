import {
  useActiveRewardsQuery,
  useMarketForRewardsQuery,
} from './__generated__/Rewards';
import { useT } from '../../lib/use-t';
import { addDecimalsFormatNumber, formatNumber } from '@vegaprotocol/utils';
import classNames from 'classnames';
import {
  Icon,
  type IconName,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  type VegaIconSize,
  TradingInput,
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
  type RecurringTransfer,
} from '@vegaprotocol/types';
import { Card } from '../card/card';
import { useMemo, useState } from 'react';
import { useAssetDataProvider } from '@vegaprotocol/assets';

export type Filter = {
  searchTerm: string;
};

export const isActiveReward = (node: TransferNode, currentEpoch: number) => {
  const { transfer } = node;
  if (transfer.kind.__typename !== 'RecurringTransfer') {
    return false;
  }
  const { dispatchStrategy } = transfer.kind;

  if (!dispatchStrategy) {
    return false;
  }

  if (transfer.kind.endEpoch && transfer.kind.endEpoch < currentEpoch) {
    return false;
  }

  if (transfer.status !== TransferStatus.STATUS_PENDING) {
    return false;
  }

  return true;
};

export const applyFilter = (transfer: Transfer, filter: Filter) => {
  if (
    transfer.kind.__typename !== 'RecurringTransfer' ||
    !transfer.kind.dispatchStrategy?.dispatchMetric
  ) {
    return false;
  }
  if (
    DispatchMetricLabels[transfer.kind.dispatchStrategy.dispatchMetric]
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    transfer.asset?.symbol
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase())
  ) {
    return true;
  }
  return false;
};

export const ActiveRewards = ({ currentEpoch }: { currentEpoch: number }) => {
  const t = useT();
  const { data: activeRewardsData } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
  });

  const [filter, setFilter] = useState<Filter>({
    searchTerm: '',
  });

  const transfers = activeRewardsData?.transfersConnection?.edges
    ?.map((e) => e?.node as TransferNode)
    .filter((node) => isActiveReward(node, currentEpoch));

  if (!transfers || !transfers.length) return null;

  return (
    <Card title={t('Active rewards')} className="lg:col-span-full">
      <div className="">
        {transfers.length > 1 && (
          <TradingInput
            onChange={(e) =>
              setFilter((curr) => ({ ...curr, searchTerm: e.target.value }))
            }
            value={filter.searchTerm}
            type="text"
            placeholder={t('Search by reward dispatch metric or asset name')}
            data-testid="search-term"
            className="mb-4 w-20"
            prependElement={<VegaIcon name={VegaIconNames.SEARCH} />}
          />
        )}
        <div className="grid gap-x-8 gap-y-10 h-fit grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(343px,_1fr))] max-h-[40rem] overflow-auto">
          {transfers
            .filter((n) => applyFilter(n.transfer, filter))
            .map((node, i) => {
              const { transfer } = node;
              if (
                transfer.kind.__typename !== 'RecurringTransfer' ||
                !transfer.kind.dispatchStrategy?.dispatchMetric
              ) {
                return null;
              }

              return (
                node && (
                  <ActiveRewardCard
                    key={i}
                    transferNode={node}
                    kind={transfer.kind}
                    currentEpoch={currentEpoch}
                  />
                )
              );
            })}
        </div>
      </div>
    </Card>
  );
};

// This was built to be a status indicator for the rewards based on the transfer status
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  kind,
}: {
  transferNode: TransferNode;
  currentEpoch: number;
  kind: RecurringTransfer;
}) => {
  const t = useT();

  const { transfer } = transferNode;
  const { dispatchStrategy } = kind;
  const marketIds = dispatchStrategy?.marketIdsInScope;

  const { data: marketNameData } = useMarketForRewardsQuery({
    variables: {
      marketId: marketIds ? marketIds[0] : '',
    },
  });

  const marketName = useMemo(() => {
    if (marketNameData && marketIds && marketIds.length > 1) {
      return 'Specific markets';
    } else if (
      marketNameData &&
      marketIds &&
      marketNameData &&
      marketIds.length === 1
    ) {
      return marketNameData?.market?.tradableInstrument?.instrument?.name || '';
    }
    return '';
  }, [marketIds, marketNameData]);

  const { data: dispatchAsset } = useAssetDataProvider(
    dispatchStrategy?.dispatchMetricAssetId || ''
  );

  if (!dispatchStrategy) {
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
              <span className="flex flex-col gap-1 text-2xl shrink-1 text-center font-glitch">
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
                  'Number of epochs after distribution to delay vesting of rewards by'
                )}
              />
              <span className="text-muted text-xs whitespace-nowrap">
                {t('{{lock}} epochs', {
                  lock: kind.dispatchStrategy?.lockPeriod,
                })}
              </span>
            </div>
          </div>

          <span className="border-[0.5px] border-gray-700" />
          {/* TODO use market symbol or market name */}
          <span>
            {DispatchMetricLabels[dispatchStrategy.dispatchMetric]}
            {marketName ? ` • ${marketName}` : ` • ${dispatchAsset?.name}`}
          </span>

          <div className="flex items-center gap-8 flex-wrap">
            {kind.endEpoch && (
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Ends in')}</span>
                <span>
                  {t('{{epochs}} epochs', {
                    epochs: kind.endEpoch
                      ? formatNumber(kind.endEpoch - currentEpoch)
                      : '-',
                  })}
                </span>
              </span>
            )}

            {
              <span className="flex flex-col">
                <span className="text-muted text-xs">{t('Assessed over')}</span>
                <span>
                  {dispatchStrategy.windowLength === 1
                    ? t('{{epochs}} epoch', {
                        epochs: formatNumber(dispatchStrategy.windowLength),
                      })
                    : t('{{epochs}} epoch(s)', {
                        epochs: formatNumber(dispatchStrategy.windowLength),
                      })}
                </span>
              </span>
            }
          </div>

          {dispatchStrategy?.dispatchMetric && (
            <span className="text-muted text-sm h-[2rem]">
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
                {kind.dispatchStrategy?.teamScope && (
                  <Tooltip
                    description={
                      <span>{kind.dispatchStrategy?.teamScope}</span>
                    }
                  >
                    <span className="flex items-center p-1 rounded-full border border-gray-600">
                      {<VegaIcon name={VegaIconNames.TEAM} size={16} />}
                    </span>
                  </Tooltip>
                )}
                {kind.dispatchStrategy?.individualScope && (
                  <Tooltip
                    description={
                      <span>{kind.dispatchStrategy?.individualScope}</span>
                    }
                  >
                    <span className="flex items-center p-1 rounded-full border border-gray-600">
                      {<VegaIcon name={VegaIconNames.MAN} size={16} />}
                    </span>
                  </Tooltip>
                )}
                {/* Shows transfer status */}
                {/* <StatusIndicator
                  status={transfer.status}
                  reason={transfer.reason}
                /> */}
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {t('Staked VEGA')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  kind.dispatchStrategy?.stakingRequirement || 0,
                  transfer.asset?.decimals || 0
                )}
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-muted">
                {t('Average position')}{' '}
              </span>
              <span className="flex items-center gap-1">
                {addDecimalsFormatNumber(
                  kind.dispatchStrategy
                    ?.notionalTimeWeightedAveragePositionRequirement || 0,
                  transfer.asset?.decimals || 0
                )}
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
        gradientClassName: 'from-vega-green-500 to-vega-yellow-500',
        mainClassName: 'from-vega-green-400 dark:from-vega-green-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_MAKER_FEES_PAID:
      return {
        gradientClassName: 'from-vega-orange-500 to-vega-pink-400',
        mainClassName: 'from-vega-orange-400 dark:from-vega-orange-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_MARKET_VALUE:
    case DispatchMetric.DISPATCH_METRIC_RELATIVE_RETURN:
      return {
        gradientClassName: 'from-vega-purple-500 to-vega-blue-400',
        mainClassName: 'from-vega-purple-400 dark:from-vega-purple-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_RETURN_VOLATILITY:
      return {
        gradientClassName: 'from-vega-blue-500 to-vega-green-400',
        mainClassName: 'from-vega-blue-400 dark:from-vega-blue-600 to-20%',
      };
    case DispatchMetric.DISPATCH_METRIC_VALIDATOR_RANKING:
    default:
      return {
        gradientClassName: 'from-vega-pink-500 to-vega-purple-400',
        mainClassName: 'from-vega-pink-400 dark:from-vega-pink-600 to-20%',
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
