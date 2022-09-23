import type { Asset } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import produce from 'immer';
import merge from 'lodash/merge';
import { useRef, useMemo } from 'react';
import {
  getId,
  accountsDataProvider,
  getAccountData,
} from './accounts-data-provider';
import { AccountTable } from './accounts-table';
import type {
  AccountEventsSubscription,
  AccountFieldsFragment,
} from './__generated__';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (asset?: string | Asset) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
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
      // if (add.length) {
      //   addSummaryRows(
      //     gridRef.current.api,
      //     gridRef.current.columnApi,
      //     getGroupId,
      //     getGroupSummaryRow
      //   );
      // }
      return true;
    };

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useMemo(() => accountsManagerUpdate(gridRef), []);
  const { data: collateralData, error, loading } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables });
  const data = collateralData && getAccountData(collateralData);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && <AccountTable
        data={data}
        ref={gridRef}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
      />}
    </AsyncRenderer>
  );
};

export default AccountManager;
