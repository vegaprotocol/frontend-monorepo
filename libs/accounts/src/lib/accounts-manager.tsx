import {
  t,
  useDataProvider,
  updateGridData,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, useCallback, memo } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import type { GetRowsParams } from './accounts-table';
import { AccountTable } from './accounts-table';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  isReadOnly: boolean;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<AccountFields[] | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      return updateGridData(dataRef, data, gridRef);
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
      const lastRow = dataRef.current ? dataRef.current.length : 0;
      successCallback(rowsThisBlock, lastRow);
    },
    []
  );
  return (
    <div className="relative h-full">
      <AccountTable
        rowModelType="infinite"
        ref={gridRef}
        datasource={{ getRows }}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        isReadOnly={isReadOnly}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          data={data}
          noDataCondition={(data) => !(data && data.length)}
          error={error}
          loading={loading}
          noDataMessage={t('No accounts')}
        />
      </div>
    </div>
  );
};

export default memo(AccountManager);
