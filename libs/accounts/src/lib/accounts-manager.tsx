import { useRef, memo, useCallback, useState } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
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
  onMarketClick,
}: {
  assetId: string;
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId, assetId },
    update: ({ data }) => {
      if (gridRef.current?.api && data?.breakdown) {
        gridRef.current?.api.setRowData(data?.breakdown);
        return true;
      }
      return false;
    },
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
      <BreakdownTable
        ref={gridRef}
        data={data?.breakdown || null}
        domLayout="autoHeight"
        onMarketClick={onMarketClick}
      />
    </div>
  );
};

export const AccountBreakdownDialog = memo(
  ({
    assetId,
    partyId,
    onClose,
    onMarketClick,
  }: {
    assetId?: string;
    partyId: string;
    onClose: () => void;
    onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  }) => {
    console.log('render');
    return (
      <Dialog
        size="medium"
        open={Boolean(assetId)}
        onChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
      >
        {assetId && (
          <AccountBreakdown
            assetId={assetId}
            partyId={partyId}
            onMarketClick={onMarketClick}
          />
        )}
      </Dialog>
    );
  }
);

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
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
  onMarketClick,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
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
  const { data, error } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId },
    update,
  });
  const bottomPlaceholderProps = useBottomPlaceholder({
    gridRef,
    disabled: noBottomPlaceholder,
  });

  const onMarketClickInternal = useCallback(
    (...args: Parameters<NonNullable<typeof onMarketClick>>) => {
      setBreakdownAssetId(undefined);
      if (onMarketClick) {
        onMarketClick(...args);
      }
    },
    [onMarketClick]
  );

  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickBreakdown={setBreakdownAssetId}
        isReadOnly={isReadOnly}
        pinnedAsset={pinnedAsset}
        storeKey={storeKey}
        {...bottomPlaceholderProps}
        overlayNoRowsTemplate={error ? error.message : t('No accounts')}
      />
      <AccountBreakdownDialog
        assetId={breakdownAssetId}
        partyId={partyId}
        onClose={useCallback(() => setBreakdownAssetId(undefined), [])}
        onMarketClick={onMarketClick ? onMarketClickInternal : undefined}
      />
    </div>
  );
};

export default memo(AccountManager);
