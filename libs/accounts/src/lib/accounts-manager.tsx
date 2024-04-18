import { useRef, memo, useState, useCallback } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from './use-t';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { type AgGridReact } from 'ag-grid-react';
import {
  aggregatedAccountsDataProvider,
  aggregatedAccountDataProvider,
} from './accounts-data-provider';
import { type PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import BreakdownTable from './breakdown-table';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';

const AccountBreakdown = ({
  assetId,
  partyId,
  onMarketClick,
}: {
  assetId: string;
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}) => {
  const t = useT();
  const gridRef = useRef<AgGridReact>(null);
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId, assetId },
    update: ({ data }) => {
      if (gridRef.current?.api && data?.breakdown) {
        gridRef.current?.api.setGridOption('rowData', data?.breakdown);
        return true;
      }
      return false;
    },
  });

  return (
    <div
      className="m-auto flex h-[35vh] w-full flex-col"
      data-testid="usage-breakdown"
    >
      <h1 className="mb-4 text-xl">
        {data?.asset?.symbol} {t('usage breakdown')}
      </h1>
      {data && (
        <p className="mb-2 text-sm">
          {t('You have {{value}} {{symbol}} in total.', {
            value: addDecimalsFormatNumber(data.total, data.asset.decimals),
            symbol: data.asset.symbol,
          })}
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
        size="large"
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
  onClickTransfer?: (assetId?: string) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  isReadOnly: boolean;
  pinnedAssets?: PinnedAsset[];
  gridProps?: ReturnType<typeof useDataGridEvents>;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  onClickTransfer,
  partyId,
  isReadOnly,
  pinnedAssets,
  onMarketClick,
  gridProps,
}: AccountManagerProps) => {
  const t = useT();
  const [breakdownAssetId, setBreakdownAssetId] = useState<string>();
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
        rowData={data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickTransfer={onClickTransfer}
        onClickBreakdown={setBreakdownAssetId}
        isReadOnly={isReadOnly}
        pinnedAssets={pinnedAssets}
        overlayNoRowsTemplate={error ? error.message : t('No accounts')}
        {...gridProps}
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
