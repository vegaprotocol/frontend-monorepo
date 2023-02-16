import { t } from '@vegaprotocol/react-helpers';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import type { components } from '../../../../../types/explorer';
import EpochOverview from '../../../epoch-overview/epoch';
import { useExplorerFutureEpochQuery } from '../../../epoch-overview/__generated__/Epoch';
import { AssetLink, MarketLink, PartyLink } from '../../../links';
import {
  SPECIAL_CASE_NETWORK,
  SPECIAL_CASE_NETWORK_ID,
} from '../../../links/party-link/party-link';
import type { IconProps } from '@vegaprotocol/ui-toolkit';
import SizeInAsset from '../../../size-in-asset/size-in-asset';
import { AccountTypeMapping } from '@vegaprotocol/types';
import { AccountType } from '@vegaprotocol/types';

export type Metric = components['schemas']['vegaDispatchMetric'];

const wrapperClasses =
  'border border-zinc-200 dark:border-zinc-800 rounded-md pv-2 mb-5 w-full sm:w-1/4 min-w-[200px] ';
const headerClasses =
  'bg-solid bg-zinc-200 dark:bg-zinc-800 border-zinc-200 text-center text-xl py-2 font-alpha';

type Transfer = components['schemas']['commandsv1Transfer'];

interface TransferRecurringProps {
  transfer: Transfer;
  from: string;
}

/**
 * Simple rendered for a recurring transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferRecurring({ transfer, from }: TransferRecurringProps) {
  const recurring = transfer.recurring;
  const { data } = useExplorerFutureEpochQuery();
  const metric =
    recurring?.dispatchStrategy?.metric || 'DISPATCH_METRIC_UNSPECIFIED';

  const fromAcct =
    transfer.fromAccountType &&
    transfer.fromAccountType !== 'ACCOUNT_TYPE_UNSPECIFIED'
      ? AccountType[transfer.fromAccountType]
      : AccountType.ACCOUNT_TYPE_GENERAL;
  const fromAccountTypeLabel = transfer.fromAccountType
    ? AccountTypeMapping[fromAcct]
    : 'Unknown';

  const toAcct =
    transfer.toAccountType &&
    transfer.toAccountType !== 'ACCOUNT_TYPE_UNSPECIFIED'
      ? AccountType[transfer.toAccountType]
      : AccountType.ACCOUNT_TYPE_GENERAL;
  const toAccountTypeLabel = transfer.fromAccountType
    ? AccountTypeMapping[toAcct]
    : 'Unknown';

  return (
    <div className="flex gap-5 flex-wrap">
      <div className={wrapperClasses}>
        <h2 className={headerClasses}>{t('Transfer')}</h2>
        <div className="relative block rounded-lg py-6 text-center">
          <PartyLink id={from} truncate={true} />
          <Tooltip
            description={
              <p>{`${t('From account')}:  ${fromAccountTypeLabel}`}</p>
            }
          >
            <span>
              <Icon className="ml-3" name={'bank-account'} />
            </span>
          </Tooltip>
          <br />

          <div className="bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center my-4 relative">
            <div className="bg-zinc-200 dark:bg-zinc-800 border w-full pt-5 pb-3 px-3 boder-zinc-200 dark:border-zinc-800 relative">
              <div className="text-xs z-20 relative leading-none">
                {transfer.asset ? (
                  <SizeInAsset
                    assetId={transfer.asset}
                    size={transfer.amount}
                  />
                ) : null}
              </div>

              <div className="z-10 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 dark:border-zinc-800 border-zinc-200 bg-white dark:bg-black border-r border-b"></div>
              <div className="z-10 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 border-zing-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 border-r border-b"></div>
            </div>
          </div>

          <TransferRecurringRecipient to={transfer.to} />
          <Tooltip
            description={<p>{`${t('To account')}: ${toAccountTypeLabel}`}</p>}
          >
            <span>
              <Icon className="ml-3" name={'bank-account'} />
            </span>
          </Tooltip>
          <br />
        </div>
      </div>
      {recurring ? (
        <div className={wrapperClasses}>
          <h2 className={headerClasses}>{t('Active epochs')}</h2>
          <div className="relative block rounded-lg py-6 text-center p-6">
            <p>
              <EpochOverview id={recurring.startEpoch} />
            </p>
            <p className="leading-10 my-2">
              <IconForEpoch
                start={recurring.startEpoch}
                end={recurring.endEpoch}
                current={data?.epoch.id}
              />
            </p>
            <p>
              {recurring.endEpoch ? (
                <EpochOverview id={recurring.endEpoch} />
              ) : (
                <span>{t('Forever')}</span>
              )}
            </p>
          </div>
        </div>
      ) : null}
      {recurring && recurring.dispatchStrategy ? (
        <div className={wrapperClasses}>
          <h2 className={headerClasses}>{t('Reward metrics')}</h2>
          <ul className="relative block rounded-lg py-6 text-center p-6">
            {recurring.dispatchStrategy.assetForMetric ? (
              <li>
                <strong>{t('Asset')}</strong>:{' '}
                <AssetLink
                  assetId={recurring.dispatchStrategy.assetForMetric}
                />
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
      ) : null}
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
    </>
  );
}

interface TransferRecurringRecipientProps {
  to?: string;
}

/**
 * Simple render for a list of Market IDs used in a Recurring Transfer
 * dispatch strategy.
 *
 * @param markets String[] IDs of markets for this dispatch strategy
 */
export function TransferRecurringRecipient({
  to,
}: TransferRecurringRecipientProps) {
  if (to === SPECIAL_CASE_NETWORK || to === SPECIAL_CASE_NETWORK_ID) {
    return <span>{t('Rewards pool')}</span>;
  } else if (to) {
    return <PartyLink id={to} truncate={true} />;
  } else {
    return null;
  }
}

export type IconForTransferProps = {
  current?: string;
  start?: string;
  end?: string;
};

function IconForEpoch({ start, end, current }: IconForTransferProps) {
  let i: IconProps['name'] = 'repeat';

  if (current && start && end) {
    const startEpoch = parseInt(start);
    const endEpoch = parseInt(end);
    const currentEpoch = parseInt(current);

    if (currentEpoch > endEpoch) {
      // If we've finished
      i = 'updated';
    } else if (startEpoch > currentEpoch) {
      // If we haven't yet started
      i = 'time';
    } else if (startEpoch < currentEpoch && endEpoch > currentEpoch) {
      i = 'repeat';
    }
  }

  return <Icon name={i} className="mr-2" />;
}
