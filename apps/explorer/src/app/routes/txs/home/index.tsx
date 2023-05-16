import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
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

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  const [filter, setFilter] = useState('');

  const onChange = useCallback((e: any) => {
    const v = e.target.value;
    setFilter(v);
  }, []);

  return (
    <section className="md:p-2 lg:p-4 xl:p-6">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <FormGroup label="Filter by..." labelFor="uniqueid">
        <Select id="uniqueid" onChange={onChange}>
          <option value="">All transactions</option>
          {FilterOptions.map((f) => (
            <option value={f}>{f}</option>
          ))}
        </Select>

        <TxsListFiltered filter={filter} />
      </FormGroup>
    </section>
  );
};

export interface TxsListFilteredProps {
  filter: string;
}

export const TxsListFiltered = ({ filter }: TxsListFilteredProps) => {
  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({
      limit: BE_TXS_PER_REQUEST,
      filters: filter ? `filters[cmd.type]=${filter}` : undefined,
    });

  return (
    <div data-filter={filter}>
      <BlocksRefetch refetch={refreshTxs} />
      <TxsInfiniteList
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
    </div>
  );
};
