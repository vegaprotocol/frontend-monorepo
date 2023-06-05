import { useRef, memo, useCallback, useState, useEffect } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { RowDataUpdatedEvent } from 'ag-grid-community';
import type { AccountFields } from './accounts-data-provider';
import {
  aggregatedAccountsDataProvider,
  aggregatedAccountDataProvider,
} from './accounts-data-provider';
import type { PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';
import isEqual from 'lodash/isEqual';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import BreakdownTable from './breakdown-table';

const AccountBreakdown = ({
  assetId,
  partyId,
}: {
  assetId: string;
  partyId: string;
}) => {
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId, assetId },
  });
  return (
    <div
      className="h-[35vh] w-full m-auto flex flex-col"
      data-testid="usage-breakdown"
    >
      <h1 className="text-xl mb-4">
        {data?.asset?.symbol} {t('usage breakdown')}
      </h1>
      {data && (
        <p className="mb-2 text-sm">
          {t('You have %s %s in total.', [
            addDecimalsFormatNumber(data.total, data.asset.decimals),
            data.asset.symbol,
          ])}
        </p>
      )}
      <BreakdownTable data={data?.breakdown || null} domLayout="autoHeight" />
    </div>
  );
};

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
  noBottomPlaceholder?: boolean;
  storeKey?: string;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
  pinnedAsset,
  noBottomPlaceholder,
  storeKey,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [hasData, setHasData] = useState(Boolean(pinnedAsset));
  const [breakdownAssetId, setBreakdownAssetId] = useState<string>();
  const update = useCallback(
    ({ data }: { data: AccountFields[] | null }) => {
      if (!data || !gridRef.current?.api) {
        return false;
      }
      const pinnedAssetRowData =
        pinnedAsset && data.find((d) => d.asset.id === pinnedAsset.id);

      if (pinnedAssetRowData) {
        const pinnedTopRow = gridRef.current.api.getPinnedTopRow(0);
        if (
          pinnedTopRow?.data?.balance === '0' &&
          pinnedAssetRowData.balance !== '0'
        ) {
          return false;
        }
        if (!isEqual(pinnedTopRow?.data, pinnedAssetRowData)) {
          gridRef.current.api.setPinnedTopRowData([pinnedAssetRowData]);
        }
      }
      gridRef.current.api.setRowData(
        pinnedAssetRowData
          ? data?.filter((d) => d !== pinnedAssetRowData)
          : data
      );
      return true;
    },
    [gridRef, pinnedAsset]
  );
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId },
    update,
  });
  const bottomPlaceholderProps = useBottomPlaceholder({
    gridRef,
    disabled: noBottomPlaceholder,
  });

  useEffect(
    () => setHasData(Boolean(pinnedAsset || data?.length)),
    [data, pinnedAsset]
  );

  const onRowDataUpdated = useCallback(
    (event: RowDataUpdatedEvent) => {
      setHasData(Boolean(pinnedAsset || event.api?.getModel().getRowCount()));
    },
    [pinnedAsset]
  );

  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={error ? [] : data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickBreakdown={setBreakdownAssetId}
        onRowDataUpdated={onRowDataUpdated}
        isReadOnly={isReadOnly}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        pinnedAsset={pinnedAsset}
        storeKey={storeKey}
        {...bottomPlaceholderProps}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          data={data}
          noDataCondition={() => !hasData}
          error={error}
          loading={loading}
          noDataMessage={pinnedAsset ? ' ' : t('No accounts')}
          reload={reload}
        />
      </div>
      <Dialog
        size="medium"
        open={Boolean(breakdownAssetId)}
        onChange={(isOpen) => {
          if (!isOpen) {
            setBreakdownAssetId(undefined);
          }
        }}
      >
        {breakdownAssetId && (
          <AccountBreakdown assetId={breakdownAssetId} partyId={partyId} />
        )}
      </Dialog>
    </div>
  );
};

export default memo(AccountManager);
