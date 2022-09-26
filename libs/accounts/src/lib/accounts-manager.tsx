import React, { useRef, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider, addSummaryRows } from '@vegaprotocol/react-helpers';
import type {
  AccountFieldsFragment,
  AccountEventsSubscription,
} from './__generated___/Accounts';

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

export const accountsManagerUpdate =
  (gridRef: React.RefObject<AgGridReact>) =>
  ({ delta: deltas }: { delta: AccountEventsSubscription['accounts'] }) => {
    const update: AccountFieldsFragment[] = [];
    const add: AccountFieldsFragment[] = [];
    if (!gridRef.current?.api) {
      return false;
    }
    const api = gridRef.current.api;
    deltas.forEach((delta) => {
      const rowNode = api.getRowNode(getId(delta));
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
        // #TODO handle new account (or leave it to data provider to handle it)
      }
    });
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
  };

export const AccountsManager = ({ partyId }: AccountsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useMemo(() => accountsManagerUpdate(gridRef), []);
  const { data, error, loading } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables });
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <AccountsTable ref={gridRef} data={data} />
    </AsyncRenderer>
  );
};
