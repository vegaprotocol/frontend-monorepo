import { t } from '@vegaprotocol/react-helpers';
import type { components } from '../../../../../types/explorer';
import EpochOverview from '../../../epoch-overview/epoch';
import { AssetLink, MarketLink } from '../../../links';

interface TransferRecurringProps {
  transfer: components['schemas']['v1RecurringTransfer'];
}

/**
 * Simple rendered for a recurring transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferRecurring({ transfer }: TransferRecurringProps) {
  return (
    <ul>
      <li>
        <strong>{t('Starting epoch')}</strong>:{' '}
        <EpochOverview id={transfer.startEpoch} />
      </li>
      <li>
        <strong>{t('Ending epoch')}</strong>:{' '}
        <EpochOverview id={transfer.endEpoch} />
      </li>
      <li>
        <strong>{t('Factor')}</strong>: {transfer.factor}
      </li>
      {transfer.dispatchStrategy ? (
        <TransferRecurringStrategy strategy={transfer.dispatchStrategy} />
      ) : null}
    </ul>
  );
}

interface TransferRecurringStrategyProps {
  strategy: components['schemas']['vegaDispatchStrategy'];
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
      {strategy.markets ? (
        <li>
          <strong>{t('Markets')}</strong>:{' '}
          <TransferRecurringMarkets markets={strategy.markets} />
        </li>
      ) : null}
    </>
  );
}

interface TransferRecurringMarketsProps {
  markets: readonly string[];
}

/**
 * Simple render for a list of Market IDs used in a Recurring Transger
 * dispatch strategy.
 *
 * @param markets String[] IDs of markets for this dispatch strategy
 */
export function TransferRecurringMarkets({
  markets,
}: TransferRecurringMarketsProps) {
  if (!markets) {
    return null;
  }

  return (
    <ul className="ml-10">
      {markets.map((m) => (
        <li key={m}>
          <MarketLink id={m} />
        </li>
      ))}
    </ul>
  );
}
