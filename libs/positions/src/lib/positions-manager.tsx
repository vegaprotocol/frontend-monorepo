import { useCallback, useEffect, useRef, useState } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Position } from '../';
import { usePositionsData, PositionsTable } from '../';
import type { FilterChangedEvent } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';

interface PositionsManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
  noBottomPlaceholder?: boolean;
}

export const PositionsManager = ({
  partyId,
  onMarketClick,
  isReadOnly,
  noBottomPlaceholder,
}: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const { data, error, loading, reload } = usePositionsData(
    partyId,
    gridRef,
    true
  );
  const create = useVegaTransactionStore((store) => store.create);
  const onClose = ({
    marketId,
    openVolume,
  }: {
    marketId: string;
    openVolume: string;
  }) =>
    create({
      batchMarketInstructions: {
        cancellations: [
          {
            marketId,
            orderId: '', // omit order id to cancel all active orders
          },
        ],
        submissions: [
          {
            marketId: marketId,
            type: Schema.OrderType.TYPE_MARKET as const,
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK as const,
            side: openVolume.startsWith('-')
              ? Schema.Side.SIDE_BUY
              : Schema.Side.SIDE_SELL,
            size: openVolume.replace('-', ''),
          },
        ],
      },
    });

  const setId = useCallback((data: Position) => {
    return {
      ...data,
      marketId: `${data.marketId}-1`,
    };
  }, []);
  const bottomPlaceholderProps = useBottomPlaceholder<Position>({
    gridRef,
    setId,
    disabled: noBottomPlaceholder,
  });
  useEffect(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, [data?.length]);
  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, []);
  return (
    <div className="h-full relative">
      <PositionsTable
        rowData={error ? [] : data}
        ref={gridRef}
        onMarketClick={onMarketClick}
        onClose={onClose}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        isReadOnly={isReadOnly}
        onFilterChanged={onFilterChanged}
        {...bottomPlaceholderProps}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No positions')}
          noDataCondition={(data) => !dataCount}
          reload={reload}
        />
      </div>
    </div>
  );
};
