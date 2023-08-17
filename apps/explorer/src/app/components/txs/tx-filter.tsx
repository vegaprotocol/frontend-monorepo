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
  Icon,
} from '@vegaprotocol/ui-toolkit';
import type { Dispatch, SetStateAction } from 'react';
import { FilterLabel } from './tx-filter-label';

// All possible transaction types. Should be generated.
export type FilterOption =
  | 'Amend LiquidityProvision Order'
  | 'Amend Order'
  | 'Batch Market Instructions'
  | 'Cancel LiquidityProvision Order'
  | 'Cancel Order'
  | 'Cancel Transfer Funds'
  | 'Chain Event'
  | 'Delegate'
  | 'Ethereum Key Rotate Submission'
  | 'Issue Signatures'
  | 'Key Rotate Submission'
  | 'Liquidity Provision Order'
  | 'Node Signature'
  | 'Node Vote'
  | 'Proposal'
  | 'Protocol Upgrade'
  | 'Register new Node'
  | 'State Variable Proposal'
  | 'Stop Orders Cancellation'
  | 'Submit Oracle Data'
  | 'Submit Order'
  | 'Transfer Funds'
  | 'Undelegate'
  | 'Validator Heartbeat'
  | 'Vote on Proposal'
  | 'Withdraw';

// Alphabetised list of transaction types to appear at the top level
export const PrimaryFilterOptions: FilterOption[] = [
  'Amend LiquidityProvision Order',
  'Amend Order',
  'Batch Market Instructions',
  'Cancel LiquidityProvision Order',
  'Cancel Order',
  'Cancel Transfer Funds',
  'Delegate',
  'Liquidity Provision Order',
  'Proposal',
  'Stop Orders Cancellation',
  'Submit Oracle Data',
  'Submit Order',
  'Transfer Funds',
  'Undelegate',
  'Vote on Proposal',
  'Withdraw',
];

// Alphabetised list of transaction types to nest under a 'More...' submenu
export const SecondaryFilterOptions: FilterOption[] = [
  'Chain Event',
  'Ethereum Key Rotate Submission',
  'Issue Signatures',
  'Key Rotate Submission',
  'Node Signature',
  'Node Vote',
  'Protocol Upgrade',
  'Register new Node',
  'State Variable Proposal',
  'Validator Heartbeat',
];

export const AllFilterOptions: FilterOption[] = [
  ...PrimaryFilterOptions,
  ...SecondaryFilterOptions,
];

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
          <FilterLabel filters={filters} />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        {filters.size > 1 ? null : (
          <>
            <DropdownMenuCheckboxItem
              onCheckedChange={() => setFilters(new Set(AllFilterOptions))}
            >
              {t('Clear filters')} <Icon name="cross" />
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          </>
        )}
        {PrimaryFilterOptions.map((f) => (
          <DropdownMenuCheckboxItem
            key={f}
            checked={filters.has(f)}
            onCheckedChange={() => {
              // NOTE: These act like radio buttons until the API supports multiple filters
              setFilters(new Set([f]));
            }}
            id={`radio-${f}`}
          >
            {f}
            <DropdownMenuItemIndicator>
              <Icon name="tick-circle" />
            </DropdownMenuItemIndicator>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('More Types')}
            <Icon name="chevron-right" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {SecondaryFilterOptions.map((f) => (
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
                  <Icon name="tick-circle" className="inline" />
                </DropdownMenuItemIndicator>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
