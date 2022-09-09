import { useRef, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider, addSummaryRows } from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment } from './__generated__/Accounts';

import type { AgGridReact } from 'ag-grid-react';
import {
  AccountsTable,
  getGroupId,
  getGroupSummaryRow,
} from './accounts-table';
import { accountsDataProvider, getId } from './accounts-data-provider';

interface AccountsManagerProps {
  partyId: string;
}

export const AccountsManager = ({ partyId }: AccountsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ delta }: { delta: AccountFieldsFragment }) => {
      const update: AccountFieldsFragment[] = [];
      const add: AccountFieldsFragment[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(getId(delta));
      if (rowNode) {
        const updatedData = produce<AccountFieldsFragment>(
          rowNode.data,
          (draft: AccountFieldsFragment) => {
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
    AccountFieldsFragment[],
    AccountFieldsFragment
  >({ dataProvider: accountsDataProvider, update, variables });
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <AccountsTable ref={gridRef} data={data} />
    </AsyncRenderer>
  );
};
