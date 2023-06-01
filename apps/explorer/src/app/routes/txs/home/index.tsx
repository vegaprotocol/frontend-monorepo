import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  FormGroup,
  Icon,
  Lozenge,
  Radio,
  RadioGroup,
  Select,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useState } from 'react';

const BE_TXS_PER_REQUEST = 20;

const FilterOptions = [
  'Submit Order',
  'Cancel Order',
  'Amend Order',
  'Withdraw',
  'Proposal',
  'Vote on Proposal',
  'Register new Node',
  'Node Vote',
  'Node Signature',
  'Liquidity Provision Order',
  'Cancel LiquidityProvision Order',
  'Amend LiquidityProvision Order',
  'Chain Event',
  'Submit Oracle Data',
  'Delegate',
  'Undelegate',
  'Key Rotate Submission',
  'State Variable Proposal',
  'Transfer Funds',
  'Cancel Transfer Funds',
  'Validator Heartbeat',
  'Ethereum Key Rotate Submission',
  'Protocol Upgrade',
  'Issue Signatures',
  'Batch Market Instructions',
];

export function getFilterLabel(filters: Set<string>) {
  if (!filters || filters.size !== 1) {
    return <span>Filter by type...</span>;
  }

  return (
    <span>
      Filtered by: <Lozenge>{Array.from(filters)[0]}</Lozenge>
    </span>
  );
}

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  const [filters, setFilters] = useState(new Set(FilterOptions));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <section className="md:p-2 lg:p-4 xl:p-6">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <DropdownMenu
        open={dropdownOpen}
        trigger={
          <DropdownMenuTrigger
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
          >
            {getFilterLabel(filters)}
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent
          onPointerDownOutside={() => setDropdownOpen(false)}
        >
          {FilterOptions.map((f) => (
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
        </DropdownMenuContent>
      </DropdownMenu>
      <TxsListFiltered filters={[...filters]} />
    </section>
  );
};

export interface TxsListFilteredProps {
  filters: string[];
}

export const TxsListFiltered = ({ filters }: TxsListFilteredProps) => {
  const f =
    filters && filters.length === 1 ? `filters[cmd.type]=${filters[0]}` : '';
  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({
      limit: BE_TXS_PER_REQUEST,
      filters: f,
    });

  return (
    <>
      <BlocksRefetch refetch={refreshTxs} />
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
