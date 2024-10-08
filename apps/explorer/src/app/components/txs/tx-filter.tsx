import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSubContent,
  VegaIcon,
  VegaIconNames,
  Button,
} from '@vegaprotocol/ui-toolkit';
import type { Dispatch, SetStateAction } from 'react';
import { FilterLabel } from './tx-filter-label';

// All possible transaction types. Should be generated.
export type FilterOption =
  | 'Amend AMM'
  | 'Amend Liquidity Provision Order'
  | 'Amend Order'
  | 'Apply Referral Code'
  | 'Batch Market Instructions'
  | 'Batch Proposal'
  | 'Cancel Liquidity Provision Order'
  | 'Cancel AMM'
  | 'Cancel Order'
  | 'Cancel Transfer Funds'
  | 'Chain Event'
  | 'Create Referral Set'
  | 'Delayed Transaction Wrapper'
  | 'Delegate'
  | 'Ethereum Key Rotate Submission'
  | 'Issue Signatures'
  | 'Join Team'
  | 'Key Rotate Submission'
  | 'Liquidity Provision Order'
  | 'Node Signature'
  | 'Node Vote'
  | 'Proposal'
  | 'Protocol Upgrade'
  | 'Register new Node'
  | 'State Variable Proposal'
  | 'Stop Orders Submission'
  | 'Stop Orders Cancellation'
  | 'Submit AMM'
  | 'Submit Oracle Data'
  | 'Submit Order'
  | 'Transfer Funds'
  | 'Undelegate'
  | 'Update Party Profile'
  | 'Update Referral Set'
  | 'Update Margin Mode'
  | 'Validator Heartbeat'
  | 'Vote on Proposal'
  | 'Withdraw';

export const filterOptions: Record<string, FilterOption[]> = {
  'Market Instructions': [
    'Amend Liquidity Provision Order',
    'Amend Order',
    'Amend AMM',
    'Batch Market Instructions',
    'Cancel Liquidity Provision Order',
    'Cancel Order',
    'Cancel AMM',
    'Liquidity Provision Order',
    'Stop Orders Submission',
    'Stop Orders Cancellation',
    'Submit Order',
    'Submit AMM',
    'Update Margin Mode',
  ],
  'Transfers and Withdrawals': [
    'Transfer Funds',
    'Cancel Transfer Funds',
    'Withdraw',
  ],
  Governance: [
    'Batch Proposal',
    'Delegate',
    'Undelegate',
    'Vote on Proposal',
    'Proposal',
  ],
  Referrals: [
    'Apply Referral Code',
    'Create Referral Set',
    'Join Team',
    'Update Party Profile',
    'Update Referral Set',
  ],
  'External Data': ['Chain Event', 'Submit Oracle Data'],
  Validators: [
    'Delayed Transaction Wrapper',
    'Ethereum Key Rotate Submission',
    'Issue Signatures',
    'Key Rotate Submission',
    'Node Signature',
    'Node Vote',
    'Protocol Upgrade',
    'Register new Node',
    'State Variable Proposal',
    'Validator Heartbeat',
  ],
};

export const AllFilterOptions: FilterOption[] =
  Object.values(filterOptions).flat();

export interface TxFilterProps {
  filters: Set<FilterOption>;
  setFilters: Dispatch<SetStateAction<Set<FilterOption>>>;
}

/**
 * Renders a structured dropdown menu of all of the available transaction
 * types. It allows a user to select one transaction type to view. Later
 * it will support multiple selection, but until the API supports that it is
 * one or all.
 * @param filters null or Set of transaction types
 * @param setFilters A function to update the filters prop
 * @returns
 */
export const TxsFilter = ({ filters, setFilters }: TxFilterProps) => {
  return (
    <DropdownMenu
      modal={false}
      trigger={
        <DropdownMenuTrigger>
          <Button size="sm">
            <FilterLabel filters={filters} />
          </Button>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        {filters.size > 1 ? null : (
          <>
            <DropdownMenuCheckboxItem
              onCheckedChange={() => setFilters(new Set(AllFilterOptions))}
            >
              {t('Clear filters')} <VegaIcon name={VegaIconNames.CROSS} />
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          </>
        )}

        {Object.entries(filterOptions).map(([key, value]) => (
          <DropdownMenuSub key={key}>
            <DropdownMenuSubTrigger>
              {t(key)}
              <VegaIcon name={VegaIconNames.CHEVRON_RIGHT} />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {value.map((f) => (
                <DropdownMenuCheckboxItem
                  key={f}
                  checked={filters.has(f)}
                  onCheckedChange={(checked) => {
                    // NOTE: These act like radio buttons until the API supports multiple filters
                    setFilters(new Set([f]));
                  }}
                  id={`radio-${f}`}
                >
                  {f}
                  <DropdownMenuItemIndicator>
                    <VegaIcon name={VegaIconNames.TICK} className="inline" />
                  </DropdownMenuItemIndicator>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
