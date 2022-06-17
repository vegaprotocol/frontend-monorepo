import { useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import type { AgGridReact } from 'ag-grid-react';
import { TransactionsTable } from './transactions-table';
import { TRANSACTIONS_QUERY } from './transactions-query';
import type {
  Transactions,
  Transactions_party_deposits,
  Transactions_party_withdrawals,
} from './__generated__/Transactions';

export type TransactionsData =
  | Transactions_party_deposits
  | Transactions_party_withdrawals;

interface TransactionsManagerProps {
  partyId: string;
}

const compileTransactions = (data?: Transactions): TransactionsData[] => {
  if (data === null || data === undefined) return [] as TransactionsData[];

  const deposits = data.party?.deposits ?? [];
  const withdrawals = data.party?.withdrawals ?? [];

  return [...deposits, ...withdrawals].sort(
    (a, b) => Number(a.createdTimestamp) - Number(b.createdTimestamp)
  );
};

export const TransactionsManager = ({ partyId }: TransactionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);

  const { data, error, loading } = useQuery<Transactions>(TRANSACTIONS_QUERY, {
    variables,
  });

  const transactions = compileTransactions(data);

  return (
    <AsyncRenderer loading={loading} error={error} data={transactions}>
      <TransactionsTable ref={gridRef} data={transactions} />
    </AsyncRenderer>
  );
};
