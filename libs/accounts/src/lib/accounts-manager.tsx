import type { Asset } from '@vegaprotocol/assets';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useCallback } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import type { GetRowsParams } from './accounts-table';
import { AccountTable } from './accounts-table';

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
  const dataRef = useRef<AccountFields[] | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      dataRef.current = data;
      gridRef.current?.api.refreshInfiniteCache();
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider<AccountFields[], never>({
    dataProvider: aggregatedAccountsDataProvider,
    update,
    variables,
  });
  if (!dataRef.current && data) {
    dataRef.current = data;
  }
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
          rowModelType={data?.length ? 'infinite' : 'clientSide'}
          rowData={data?.length ? undefined : []}
          ref={gridRef}
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
