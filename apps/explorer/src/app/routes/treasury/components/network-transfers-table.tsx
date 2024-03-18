import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { AccountType } from '@vegaprotocol/types';
import { useExplorerTreasuryTransfersQuery } from '../__generated__/TreasuryTransfers';
import { t } from '@vegaprotocol/i18n';
import { NetworkTransfersTableOneOff } from './network-transferse-oneoff';
import { NetworkTransfersTableRecurring } from './network-transferse-recurring';

export const colours = {
  INCOMING: '!fill-vega-green-600 text-vega-green-600 mr-2',
  OUTGOING: '!fill-vega-pink-600 text-vega-pink-600 mr-2',
};

export const theadClasses =
  'py-2 border text-center bg-vega-light-150 dark:bg-vega-dark-150';

export function getToAccountTypeLabel(type?: AccountType): string {
  switch (type) {
    case AccountType.ACCOUNT_TYPE_NETWORK_TREASURY:
      return t('Treasury');
    case AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE:
    case AccountType.ACCOUNT_TYPE_FEES_MAKER:
    case AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY:
    case AccountType.ACCOUNT_TYPE_LP_LIQUIDITY_FEES:
    case AccountType.ACCOUNT_TYPE_PENDING_FEE_REFERRAL_REWARD:
      return t('Fees');
    case AccountType.ACCOUNT_TYPE_GLOBAL_INSURANCE:
      return t('Insurance');
    case AccountType.ACCOUNT_TYPE_GLOBAL_REWARD:
    case AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION:
    case AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES:
    case AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS:
    case AccountType.ACCOUNT_TYPE_REWARD_RELATIVE_RETURN:
    case AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY:
    case AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING:
    case AccountType.ACCOUNT_TYPE_VESTED_REWARDS:
    case AccountType.ACCOUNT_TYPE_VESTING_REWARDS:
      return t('Rewards');
    default:
      return t('Other');
  }
}

export function isGovernanceTransfer(kind?: string): boolean {
  if (kind && kind.includes('Governance')) {
    return true;
  }

  return false;
}

export function typeLabel(kind?: string): string {
  switch (kind) {
    case 'OneOffTransfer':
      return t('Transfer - one time');
    case 'RecurringTransfer':
      return t('Transfer - repeating');
    case 'OneOffGovernanceTransfer':
      return t('Governance - one time');
    case 'RecurringGovernanceTransfer':
      return t('Governance - repeating');
    default:
      return t('Unknown');
  }
}

export const NetworkTransfersTable = () => {
  const { data, loading, error } = useExplorerTreasuryTransfersQuery({
    // This needs to ignore error as old assets may no longer properly resolve
    errorPolicy: 'ignore',
  });

  return (
    <section>
      <AsyncRenderer
        data={data}
        loading={loading}
        error={error}
        render={(data) => {
          return (
            <>
              <NetworkTransfersTableOneOff transfers={data} />
              <NetworkTransfersTableRecurring transfers={data} />
            </>
          );
        }}
      />
    </section>
  );
};
