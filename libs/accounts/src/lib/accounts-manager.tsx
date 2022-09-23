import type { Asset } from '@vegaprotocol/react-helpers';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { IGetRowsParams } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useCallback } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { accountsDataProvider } from './accounts-data-provider';
import { AccountTable } from './accounts-table';
import type { AccountEventsSubscription } from './__generated__';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (asset?: string | Asset) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
}

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: AccountFields[], lastRow?: number): void;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<AccountFields[] | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      dataRef.current = data;
      gridRef.current.api.refreshInfiniteCache();
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider<
    AccountFields[],
    AccountEventsSubscription['accounts']
  >({ dataProvider: accountsDataProvider, update, variables });
  dataRef.current = data;
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: GetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current.slice(startRow, endRow)
      : [];
    const lastRow = dataRef.current?.length ?? -1;
    successCallback(rowsThisBlock, lastRow);
  };
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {data && (
        <AccountTable
          data={data}
          ref={gridRef}
          rowModelType={dataRef.current?.length ? 'infinite' : 'clientSide'}
          rowData={dataRef.current?.length ? undefined : []}
          datasource={{ getRows }}
          onClickAsset={onClickAsset}
          onClickDeposit={onClickDeposit}
          onClickWithdraw={onClickWithdraw}
        />
      )}
    </AsyncRenderer>
  );
};

export default AccountManager;
