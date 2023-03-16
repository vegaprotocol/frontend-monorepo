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
import type { RowClassParams, RowHeightParams } from 'ag-grid-community';
import classNames from 'classnames';

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
  const variables = useMemo(
    () => ({ partyId, pinnedAsset }),
    [partyId, pinnedAsset]
  );
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
  });

  const getRowHeight = useCallback(
    (params: RowHeightParams) => (params.node.rowPinned ? 32 : 22),
    []
  );

  const getRowClass = useCallback(
    ({ data: rowData }: RowClassParams) => {
      const currentPinnedAssetRow = data?.find(
        (row) => row.asset.id === pinnedAsset?.id
      );
      const shouldHighlight =
        rowData?.asset.id === pinnedAsset?.id && currentPinnedAssetRow;
      return classNames({ '!bg-vega-yellow !text-black': shouldHighlight });
    },
    [pinnedAsset?.id, data]
  );

  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={error ? [] : data ?? []}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        isReadOnly={isReadOnly}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        pinnedAsset={pinnedAsset}
        getRowClass={getRowClass}
        getRowHeight={getRowHeight}
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
