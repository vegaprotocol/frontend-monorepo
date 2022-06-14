import { useRef, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider, addSummaryRows } from '@vegaprotocol/react-helpers';

import type { AgGridReact } from 'ag-grid-react';
import {
  TransactionsTable,
  getGroupId,
  getGroupSummaryRow,
} from './transactions-table';
import { transactionsDataProvider } from './transactions-data-provider';
import type { TransactionsData } from './transactions-data-provider';

type TransactionsSubscribe_accounts = any;

interface TransactionsManagerProps {
  partyId: string;
}

export const TransactionsManager = ({ partyId }: TransactionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    (delta: TransactionsSubscribe_accounts) => {
      const update: TransactionsData[] = [];
      const add: TransactionsData[] = [];
      if (!gridRef.current) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(delta.id);
      if (rowNode) {
        const updatedData = produce<TransactionsData>(
          rowNode.data,
          (draft: TransactionsData) => {
            merge(draft, delta);
          }
        );
        if (updatedData !== rowNode.data) {
          update.push(updatedData);
        }
      } else {
        add.push(delta);
      }
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      if (add.length) {
        addSummaryRows(
          gridRef.current.api,
          gridRef.current.columnApi,
          getGroupId,
          getGroupSummaryRow
        );
      }
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider<
    TransactionsData[],
    TransactionsSubscribe_accounts
  >(transactionsDataProvider, update, variables);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <TransactionsTable ref={gridRef} data={data} />
    </AsyncRenderer>
  );
};
