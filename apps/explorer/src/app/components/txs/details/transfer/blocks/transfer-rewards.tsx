import { t } from '@vegaprotocol/i18n';
import { AssetLink, MarketLink } from '../../../../links';
import { headerClasses, wrapperClasses } from '../transfer-details';
import type { components } from '../../../../../../types/explorer';
import type { Recurring } from '../transfer-details';
import { DispatchMetricLabels } from '@vegaprotocol/types';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

export type Metric = components['schemas']['vegaDispatchMetric'];
export type Strategy = components['schemas']['vegaDispatchStrategy'];

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
        {distributionStrategy}

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
            <strong>
              {t('notionalTimeWeightedAveragePositionRequirement')}
            </strong>
            : {notionalTimeWeightedAveragePositionRequirement}
          </li>
        ) : null}

        {nTopPerformers && (
          <li>
            <strong>{t('Top performers')}</strong>: {nTopPerformers}
          </li>
        )}

        {rankTable && rankTable.length > 0 ? (
          <li>
            <strong>{t('Ranks')}</strong>: {rankTable.toString()}
          </li>
        ) : null}
      </ul>
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
