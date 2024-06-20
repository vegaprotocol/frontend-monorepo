import { t } from '@vegaprotocol/i18n';
import { AssetLink, MarketLink } from '../../../../links';
import type { components } from '../../../../../../types/explorer';
import type { Recurring } from '../transfer-details';
import {
  DispatchMetricLabels,
  DistributionStrategy,
} from '@vegaprotocol/types';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '@vegaprotocol/utils';
export type Metric = components['schemas']['vegaDispatchMetric'];
export type Strategy = components['schemas']['vegaDispatchStrategy'];

export const wrapperClasses = 'border pv-2 w-full flex-auto basis-full';
export const headerClasses =
  'bg-solid bg-vega-light-150 dark:bg-vega-dark-150 text-center text-xl py-2 font-alpha calt';

const metricLabels: Record<Metric, string> = {
  DISPATCH_METRIC_UNSPECIFIED: 'Unknown metric',
  ...DispatchMetricLabels,
};

// Maps the two (non-null) values of entityScope to the icon that represents it
const entityScopeIcons: Record<
  string,
  typeof VegaIconNames[keyof typeof VegaIconNames]
> = {
  ENTITY_SCOPE_INDIVIDUALS: VegaIconNames.MAN,
  ENTITY_SCOPE_TEAMS: VegaIconNames.TEAM,
};

const distributionStrategyLabel: Record<DistributionStrategy, string> = {
  [DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA]: 'Pro Rata',
  [DistributionStrategy.DISTRIBUTION_STRATEGY_RANK]: 'Ranked',
};

interface TransferRewardsProps {
  recurring: Recurring;
}

/**
 * Renders recurring transfers/game details in a way that is, perhaps, easy to understand
 *
 * @param transfer A recurring transfer object
 */
export function TransferRewards({ recurring }: TransferRewardsProps) {
  if (!recurring || !recurring.dispatchStrategy) {
    return null;
  }

  // Destructure to make things a bit more readable
  const {
    entityScope,
    individualScope,
    teamScope,
    distributionStrategy,
    lockPeriod,
    markets,
    stakingRequirement,
    windowLength,
    notionalTimeWeightedAveragePositionRequirement,
    rankTable,
    nTopPerformers,
  } = recurring.dispatchStrategy;

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{getRewardTitle(entityScope)}</h2>
      <ul className="relative block rounded-lg py-6 text-left p-6">
        {entityScope && entityScopeIcons[entityScope] ? (
          <li>
            <strong>{t('Scope')}</strong>:{' '}
            <VegaIcon name={entityScopeIcons[entityScope]} />
            &nbsp;
            {individualScope ? individualScopeLabels[individualScope] : null}
            {getScopeLabel(entityScope, teamScope)}
          </li>
        ) : null}
        {recurring.dispatchStrategy &&
          recurring.dispatchStrategy.assetForMetric && (
            <li>
              <strong>{t('Asset for metric')}</strong>:{' '}
              <AssetLink assetId={recurring.dispatchStrategy.assetForMetric} />
            </li>
          )}
        {recurring.dispatchStrategy.metric &&
          metricLabels[recurring.dispatchStrategy.metric] && (
            <li>
              <strong>{t('Metric')}</strong>:{' '}
              {metricLabels[recurring.dispatchStrategy.metric]}
            </li>
          )}
        {lockPeriod && (
          <li>
            <strong>{t('Reward lock')}</strong>:&nbsp;
            {recurring.dispatchStrategy.lockPeriod}{' '}
            {recurring.dispatchStrategy.lockPeriod === '1'
              ? t('epoch')
              : t('epochs')}
          </li>
        )}

        {markets && markets.length > 0 ? (
          <li>
            <strong>{t('Markets in scope')}</strong>:
            <ul className="inline-block ml-1">
              {markets.map((m) => (
                <li key={m} className="inline-block mr-2">
                  <MarketLink id={m} />
                </li>
              ))}
            </ul>
          </li>
        ) : null}

        {stakingRequirement && stakingRequirement !== '0' ? (
          <li>
            <strong>{t('Staking requirement')}</strong>: {stakingRequirement}
          </li>
        ) : null}

        {windowLength && windowLength !== '0' ? (
          <li>
            <strong>{t('Window length')}</strong>:{' '}
            {recurring.dispatchStrategy.windowLength}{' '}
            {recurring.dispatchStrategy.windowLength === '1'
              ? t('epoch')
              : t('epochs')}
          </li>
        ) : null}

        {notionalTimeWeightedAveragePositionRequirement &&
        notionalTimeWeightedAveragePositionRequirement !== '' ? (
          <li>
            <strong>{t('Notional TWAP')}</strong>:{' '}
            {notionalTimeWeightedAveragePositionRequirement}
          </li>
        ) : null}

        {nTopPerformers && (
          <li>
            <strong>{t('Elligible team members:')}</strong> top{' '}
            {`${formatNumber(Number(nTopPerformers) * 100, 0)}%`}
          </li>
        )}

        {distributionStrategy &&
          distributionStrategy !== 'DISTRIBUTION_STRATEGY_UNSPECIFIED' && (
            <li>
              <strong>{t('Distribution strategy')}</strong>:{' '}
              {distributionStrategyLabel[distributionStrategy]}
            </li>
          )}
      </ul>
      <div className="px-6 pt-1 pb-5">
        {rankTable && rankTable.length > 0 ? (
          <table className="border-collapse border border-gray-400 ">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-300 px-3">
                  <strong>{t('Start rank')}</strong>
                </th>
                <th className="border border-gray-300 bg-gray-300 px-3">
                  <strong>{t('Share of reward pool')}</strong>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankTable.map((row, i) => {
                return (
                  <tr key={`rank-${i}`}>
                    <td className="border border-slate-300 text-center">
                      {row.startRank}
                    </td>
                    <td className="border border-slate-300 text-center">
                      {row.shareRatio}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

export function getScopeLabel(
  scope: components['schemas']['vegaEntityScope'] | undefined,
  teamScope: readonly string[] | undefined
): string {
  if (scope === 'ENTITY_SCOPE_TEAMS') {
    if (teamScope && teamScope.length !== 0) {
      return ` ${teamScope.length} teams`;
    } else {
      return t('All teams');
    }
  } else if (scope === 'ENTITY_SCOPE_INDIVIDUALS') {
    return t('Individuals');
  } else {
    return '';
  }
}
export function getRewardTitle(
  scope?: components['schemas']['vegaEntityScope']
) {
  if (scope === 'ENTITY_SCOPE_TEAMS') {
    return t('Game');
  }
  return t('Reward metrics');
}

const individualScopeLabels: Record<
  components['schemas']['vegaIndividualScope'],
  string
> = {
  // Unspecified and All are not rendered
  INDIVIDUAL_SCOPE_UNSPECIFIED: '',
  INDIVIDUAL_SCOPE_ALL: '',
  INDIVIDUAL_SCOPE_IN_TEAM: '(in team)',
  INDIVIDUAL_SCOPE_NOT_IN_TEAM: '(not in team)',
  INDIVIDUAL_SCOPE_AMM: '',
};
