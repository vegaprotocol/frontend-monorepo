import { useRef, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider, addSummaryRows } from '@vegaprotocol/react-helpers';
import type { AccountSubscribe_accounts } from './__generated__/AccountSubscribe';
import type { Accounts_party_accounts } from './__generated__/Accounts';

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
    (delta: AccountSubscribe_accounts) => {
      const update: Accounts_party_accounts[] = [];
      const add: Accounts_party_accounts[] = [];
      if (!gridRef.current) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(getId(delta));
      if (rowNode) {
        const updatedData = produce<Accounts_party_accounts>(
          rowNode.data,
          (draft: Accounts_party_accounts) => {
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
    Accounts_party_accounts[],
    AccountSubscribe_accounts,
    never
  >(accountsDataProvider, update, variables);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <AccountsTable ref={gridRef} data={data} />
    </AsyncRenderer>
  );
};
