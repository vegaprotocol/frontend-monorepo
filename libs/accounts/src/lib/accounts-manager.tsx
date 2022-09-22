import type { Asset } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import produce from 'immer';
import merge from 'lodash/merge';
import { useRef, useCallback } from 'react';
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

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const update = useCallback(
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
      return true;
    },
    [gridRef]
  );

  const { data: collateralData } = useDataProvider<
    AccountFieldsFragment[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables: { partyId } });
  const data = collateralData && getAccountData(collateralData);
  return (
    <AccountTable
      data={data}
      ref={gridRef}
      onClickAsset={onClickAsset}
      onClickDeposit={onClickDeposit}
      onClickWithdraw={onClickWithdraw}
    />
  );
};

export default AccountManager;
