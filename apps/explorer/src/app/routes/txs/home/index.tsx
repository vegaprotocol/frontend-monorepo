import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
  DropdownMenuSubContent,
} from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import classNames from 'classnames';

const BE_TXS_PER_REQUEST = 15;

type FilterOption =
  | 'Transfer Funds'
  | 'Submit Order'
  | 'Chain Event'
  | 'Withdraw'
  | 'Proposal'
  | 'Vote on Proposal'
  | 'Liquidity Provision Order'
  | 'Amend LiquidityProvision Order'
  | 'Submit Oracle Data'
  | 'Amend Order'
  | 'Register new Node'
  | 'Cancel Order'
  | 'Batch Market Instructions'
  | 'Node Vote'
  | 'Node Signature'
  | 'Cancel LiquidityProvision Order'
  | 'Delegate'
  | 'Undelegate'
  | 'Key Rotate Submission'
  | 'State Variable Proposal'
  | 'Cancel Transfer Funds'
  | 'Validator Heartbeat'
  | 'Ethereum Key Rotate Submission'
  | 'Protocol Upgrade'
  | 'Issue Signatures';

const PrimaryFilterOptions: FilterOption[] = [
  'Transfer Funds',
  'Submit Order',
  'Chain Event',
  'Withdraw',
  'Proposal',
  'Vote on Proposal',
  'Liquidity Provision Order',
  'Submit Oracle Data',
  'Batch Market Instructions',
  'Delegate',
  'Undelegate',
  'Amend LiquidityProvision Order',
  'Amend Order',
  'Cancel LiquidityProvision Order',
  'Cancel Order',
  'Cancel Transfer Funds',
];

const SecondaryFilterOptions: FilterOption[] = [
  'Register new Node',
  'Key Rotate Submission',
  'State Variable Proposal',
  'Validator Heartbeat',
  'Ethereum Key Rotate Submission',
  'Protocol Upgrade',
  'Issue Signatures',
  'Node Signature',
  'Node Vote',
];

const AllFilterOptions: FilterOption[] = [
  ...PrimaryFilterOptions,
  ...SecondaryFilterOptions,
];

const itemClass = classNames(
  'relative flex gap-2 items-center rounded-sm p-2 text-sm',
  'cursor-default',
  'hover:bg-white dark:hover:bg-vega-dark-200',
  'focus:bg-white dark:focus:bg-vega-dark-200',
  'select-none',
  'whitespace-nowrap'
);

export function getFilterLabel(filters: Set<string>) {
  if (!filters || filters.size !== 1) {
    return <span>Filter</span>;
  }

  return (
    <span>
      Filters: <code>{Array.from(filters)[0]}</code>
    </span>
  );
}

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  return (
    <section className="md:p-2 lg:p-4 xl:p-6 relative">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <TxsListFiltered />
    </section>
  );
};

export const TxsListFiltered = () => {
  const [filters, setFilters] = useState(new Set(AllFilterOptions));

  const f =
    filters && filters.size === 1
      ? `filters[cmd.type]=${Array.from(filters)[0]}`
      : '';
  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({
      limit: BE_TXS_PER_REQUEST,
      filters: f,
    });

  return (
    <>
      <menu className="mb-2">
        <BlocksRefetch refetch={refreshTxs} />

        <DropdownMenu
          modal={false}
          trigger={
            <DropdownMenuTrigger>{getFilterLabel(filters)}</DropdownMenuTrigger>
          }
        >
          <DropdownMenuContent>
            {filters.size > 1 ? null : (
              <>
                <DropdownMenuCheckboxItem
                  onCheckedChange={(checked) =>
                    setFilters(new Set(AllFilterOptions))
                  }
                >
                  Clear filters <Icon name="cross" />
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
              </>
            )}
            {PrimaryFilterOptions.map((f) => (
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
                  <Icon name="tick-circle" />
                </DropdownMenuItemIndicator>
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className={itemClass}>
                More Types
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
      </menu>
      <TxsInfiniteList
        filters={f}
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
    </>
  );
};
