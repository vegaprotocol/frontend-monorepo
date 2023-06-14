import { useRef, memo, useState, useCallback } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
import {
  aggregatedAccountsDataProvider,
  aggregatedAccountDataProvider,
} from './accounts-data-provider';
import type { PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import BreakdownTable from './breakdown-table';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { ColumnState } from 'ag-grid-community';
import { useDataGridStore } from '@vegaprotocol/datagrid';

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
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
  pinnedAsset,
  onMarketClick,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [breakdownAssetId, setBreakdownAssetId] = useState<string>();
  const [gridStore, update] = useAccountStore((store) => [
    store.gridStore,
    store.update,
  ]);
  const gridStoreCallbacks = useDataGridStore(gridStore, (colState) => {
    update(colState);
  });

  const { data, error } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId },
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
        overlayNoRowsTemplate={error ? error.message : t('No accounts')}
        {...gridStoreCallbacks}
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

type Store = {
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};
const useAccountStore = create<{
  gridStore: Store;
  update: (gridStore: Store) => void;
}>()(
  persist(
    subscribeWithSelector((set) => ({
      gridStore: {},
      update: (newStore) => {
        set((curr) => ({
          gridStore: {
            ...curr.gridStore,
            ...newStore,
          },
        }));
      },
    })),
    {
      name: 'vega_accounts_store',
    }
  )
);
