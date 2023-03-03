import { useRef, useMemo, memo, useCallback, useEffect } from 'react';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useBottomPlaceholder } from '@vegaprotocol/utils';
import type { AccountFields } from './accounts-data-provider';
import { aggregatedAccountsDataProvider } from './accounts-data-provider';
import type { PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
  pinnedAsset,
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
  const onGridReady = useCallback(() => {
    setTimeout(() => {
      gridRef.current?.api.sizeColumnsToFit();
    }, 500);
  }, []);
  useEffect(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [data]);
  const bottomPlaceholderProps = useBottomPlaceholder({ gridRef });

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
        pinnedAsset={pinnedAsset}
        onGridReady={onGridReady}
        {...bottomPlaceholderProps}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          data={data}
          noDataCondition={(data) => !(data && data.length)}
          error={error}
          loading={loading}
          noDataMessage={pinnedAsset ? ' ' : t('No accounts')}
          reload={reload}
        />
      </div>
    </div>
  );
};

export default memo(AccountManager);
