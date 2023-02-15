import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useRef, useMemo, memo } from 'react';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
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
  const variables = useMemo(() => ({ partyId }), [partyId]);

  const { data, loading, error, reload } = useDataProvider<
    AccountFields[],
    never
  >({
    dataProvider: aggregatedAccountsDataProvider,
    variables,
  });
  console.log('data', data);
  console.log('error', error);
  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={error ? [] : data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        isReadOnly={isReadOnly}
        noRowsOverlayComponent={() => null}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          data={data}
          noDataCondition={(data) => !(data && data.length)}
          error={error}
          loading={loading}
          noDataMessage={t('No accounts')}
          reload={reload}
        />
      </div>
    </div>
  );
};

export default memo(AccountManager);
