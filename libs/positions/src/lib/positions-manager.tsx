import { useCallback, useRef, useState } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Position } from '../';
import { usePositionsData, PositionsTable } from '../';
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
  storeKey?: string;
}

export const PositionsManager = ({
  partyId,
  onMarketClick,
  isReadOnly,
  noBottomPlaceholder,
  storeKey,
}: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, reload } = usePositionsData(partyId, gridRef);
  const [dataCount, setDataCount] = useState(data?.length ?? 0);
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
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC as const,
            side: openVolume.startsWith('-')
              ? Schema.Side.SIDE_BUY
              : Schema.Side.SIDE_SELL,
            size: openVolume.replace('-', ''),
            reduceOnly: true,
          },
        ],
      },
    });

  const setId = useCallback((data: Position, id: string) => {
    return {
      ...data,
      marketId: id,
    };
  }, []);
  const bottomPlaceholderProps = useBottomPlaceholder<Position>({
    gridRef,
    setId,
    disabled: noBottomPlaceholder,
  });
  const updateRowCount = useCallback(() => {
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
        onFilterChanged={updateRowCount}
        onRowDataUpdated={updateRowCount}
        {...bottomPlaceholderProps}
        storeKey={storeKey}
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
