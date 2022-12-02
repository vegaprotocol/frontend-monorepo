import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useCallback, memo } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import type { GetRowsParams } from './accounts-table';
import { AccountTable, AccountTableEmpty } from './accounts-table';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
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
      const isEmpty = !dataRef.current?.length;
      dataRef.current = data;
      if (dataRef.current?.length) {
        gridRef.current?.api?.refreshInfiniteCache();
      }
      return !isEmpty;
    },
    [gridRef]
  );

  const { data, loading, error } = useDataProvider<AccountFields[], never>({
    dataProvider: aggregatedAccountsDataProvider,
    update,
    variables,
  });
  const getRows = useCallback(
    async ({ successCallback, startRow, endRow }: GetRowsParams) => {
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow)
        : [];
      const lastRow = dataRef.current?.length ?? -1;
      successCallback(rowsThisBlock, lastRow);
    },
    []
  );
  const isNotEmpty = Boolean(data?.length);
  const content = useMemo(() => {
    return isNotEmpty ? (
      <AccountTable
        rowModelType="infinite"
        ref={gridRef}
        datasource={{ getRows }}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
      />
    ) : (
      <AccountTableEmpty rowModelType="clientSide" rowData={[]} />
    );
  }, [isNotEmpty, getRows, onClickAsset, onClickDeposit, onClickWithdraw]);

  return (
    <AsyncRenderer data={data} error={error} loading={loading}>
      {content}
    </AsyncRenderer>
  );
};

export default memo(AccountManager);
