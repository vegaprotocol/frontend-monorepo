import { t } from '@vegaprotocol/i18n';
import { AssetLink, MarketLink } from '../../../../links';
import type { components } from '../../../../../../types/explorer';
import type { Recurring } from '../transfer-details';
import {
  DispatchMetricLabels,
  DistributionStrategy,
} from '@vegaprotocol/types';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

export type Metric = components['schemas']['vegaDispatchMetric'];
export type Strategy = components['schemas']['vegaDispatchStrategy'];

export const wrapperClasses =
  'border border-vega-light-150 dark:border-vega-dark-200 rounded-md pv-2 mb-5 w-full sm:w-3/4 min-w-[200px] ';
export const headerClasses =
  'bg-solid bg-vega-light-150 dark:bg-vega-dark-150 border-vega-light-150 text-center text-xl py-2 font-alpha calt';

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
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferRewards({ recurring }: TransferRewardsProps) {
  const metric =
    recurring?.dispatchStrategy?.metric || 'DISPATCH_METRIC_UNSPECIFIED';

  if (!recurring || !recurring.dispatchStrategy) {
    return null;
  }

  // Destructure to make things a bit more readable
  const {
    assetForMetric,
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
        {assetForMetric ? (
          <li>
            <strong>{t('Asset')}</strong>:{' '}
            <AssetLink assetId={assetForMetric} />
          </li>
        ) : null}
        <li>
          <strong>{t('Metric')}</strong>: {metricLabels[metric]}
        </li>
        {entityScope && entityScopeIcons[entityScope] ? (
          <li>
            <strong>{t('Scope')}</strong>:{' '}
            <VegaIcon name={entityScopeIcons[entityScope]} />
            {individualScope ? individualScopeLabels[individualScope] : null}
          </li>
        ) : null}

        {teamScope}

        {lockPeriod && lockPeriod !== '0' ? (
          <li>
            <strong>{t('Lock')}</strong>: {lockPeriod}
          </li>
        ) : null}

        {markets && markets.length > 0 ? (
          <li>
            <strong>{t('Markets in scope')}</strong>:
            <ul>
              {markets.map((m) => (
                <li key={m}>
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
            {recurring.dispatchStrategy.windowLength}
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
            <strong>{t('Top performers')}</strong>: {nTopPerformers}
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
          <table className="border-collapse border border-slate-400 ">
            <thead>
              <tr>
                <th className="border border-slate-300 bg-slate-300 px-3">
                  <strong>{t('Start rank')}</strong>
                </th>
                <th className="border border-slate-300 bg-slate-300 px-3">
                  <strong>{t('Share of reward pool')}</strong>
                </th>
              </tr>
            </thead>
            <tbody>
              {rankTable.map((row, i) => {
                return (
                  <tr>
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

export function getRewardTitle(
  scope?: components['schemas']['vegaEntityScope']
) {
  if (scope === 'ENTITY_SCOPE_TEAMS') {
    return t('Game');
  }
  return t('Reward metrics');
}

interface TransferRecurringStrategyProps {
  strategy: Strategy;
}

/**
 * Simple renderer for a dispatch strategy in a recurring transfer
 *
 * @param strategy Dispatch strategy object
 */
export function TransferRecurringStrategy({
  strategy,
}: TransferRecurringStrategyProps) {
  if (!strategy) {
    return null;
  }

  return (
    <>
      {strategy.assetForMetric ? (
        <li>
          <strong>{t('Asset for metric')}</strong>:{' '}
          <AssetLink assetId={strategy.assetForMetric} />
        </li>
      ) : null}
      <li>
        <strong>{t('Metric')}</strong>: {strategy.metric}
      </li>
    </>
  );
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
};
