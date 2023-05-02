import { useRef, useMemo, memo, useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import {
  useDataProvider,
  useBottomPlaceholder,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
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
  noBottomPlaceholder?: boolean;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
  pinnedAsset,
  noBottomPlaceholder,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables,
  });
  const setId = useCallback(
    (data: AccountFields) => ({
      ...data,
      asset: { ...data.asset, id: `${data.asset.id}-1` },
    }),
    []
  );
  const bottomPlaceholderProps = useBottomPlaceholder<AccountFields>({
    gridRef,
    setId,
    disabled: noBottomPlaceholder,
  });

  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={error ? [] : data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        isReadOnly={isReadOnly}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        pinnedAsset={pinnedAsset}
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
