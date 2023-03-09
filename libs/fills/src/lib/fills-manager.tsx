import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import type { BodyScrollEvent, BodyScrollEndEvent } from 'ag-grid-community';
import { useFillsList } from './use-fills-list';
import type { Trade } from './fills-data-provider';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';

interface FillsManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string) => void;
}

export const FillsManager = ({
  partyId,
  marketId,
  onMarketClick,
}: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const {
    data,
    error,
    loading,
    addNewRows,
    getRows,
    reload,
    makeBottomPlaceholders,
  } = useFillsList({
    partyId,
    marketId,
    gridRef,
    scrolledToTop,
  });

  const checkBottomPlaceholder = useCallback(() => {
    const rowCont = gridRef.current?.api?.getModel().getRowCount() ?? 0;
    const lastRowIndex = gridRef.current?.api?.getLastDisplayedRow();
    console.log('rowCont', rowCont);
    console.log('lastRowIndex', lastRowIndex);
    if (lastRowIndex && rowCont - 1 === lastRowIndex) {
      const lastrow = gridRef.current?.api.getDisplayedRowAtIndex(lastRowIndex);
      lastrow?.setRowHeight(50);
      makeBottomPlaceholders(lastrow?.data);
      gridRef.current?.api.onRowHeightChanged();
      gridRef.current?.api.refreshInfiniteCache();
    }
  }, [makeBottomPlaceholders]);

  const onBodyScrollEnd = useCallback(
    (event: BodyScrollEndEvent) => {
      if (event.top === 0) {
        addNewRows();
      }
      checkBottomPlaceholder();
    },
    [addNewRows, checkBottomPlaceholder]
  );

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  const { isFullWidthRow, fullWidthCellRenderer, rowClassRules } =
    useBottomPlaceholder<Trade>({
      gridRef,
    });

  return (
    <div className="h-full relative">
      <FillsTable
        ref={gridRef}
        partyId={partyId}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onMarketClick={onMarketClick}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        isFullWidthRow={isFullWidthRow}
        fullWidthCellRenderer={fullWidthCellRenderer}
        rowClassRules={rowClassRules}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No fills')}
          noDataCondition={(data) => !(data && data.length)}
          reload={reload}
        />
      </div>
    </div>
  );
};
