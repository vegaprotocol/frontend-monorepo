import { t } from '@vegaprotocol/react-helpers';
import { AssetLink, MarketLink } from '../../../../links';
import { headerClasses, wrapperClasses } from '../transfer-details';
import type { components } from '../../../../../../types/explorer';
import type { Recurring } from '../transfer-details';

export type Metric = components['schemas']['vegaDispatchMetric'];
export type Strategy = components['schemas']['vegaDispatchStrategy'];

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

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{t('Reward metrics')}</h2>
      <ul className="relative block rounded-lg py-6 text-center p-6">
        {recurring.dispatchStrategy.assetForMetric ? (
          <li>
            <strong>{t('Asset')}</strong>:{' '}
            <AssetLink assetId={recurring.dispatchStrategy.assetForMetric} />
          </li>
        ) : null}
        <li>
          <strong>{t('Metric')}</strong>: {metricLabels[metric]}
        </li>
        {recurring.dispatchStrategy.markets &&
        recurring.dispatchStrategy.markets.length > 0 ? (
          <li>
            <strong>{t('Markets in scope')}</strong>:
            <ul>
              {recurring.dispatchStrategy.markets.map((m) => (
                <li key={m}>
                  <MarketLink id={m} />
                </li>
              ))}
            </ul>
          </li>
        ) : null}
        <li>
          <strong>{t('Factor')}</strong>: {recurring.factor}
        </li>
      </ul>
    </div>
  );
}

const metricLabels: Record<Metric, string> = {
  DISPATCH_METRIC_LP_FEES_RECEIVED: 'Liquidity Provision fees received',
  DISPATCH_METRIC_MAKER_FEES_PAID: 'Price maker fees paid',
  DISPATCH_METRIC_MAKER_FEES_RECEIVED: 'Price maker fees earned',
  DISPATCH_METRIC_MARKET_VALUE: 'Total market Value',
  DISPATCH_METRIC_UNSPECIFIED: 'Unknown metric',
};

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
