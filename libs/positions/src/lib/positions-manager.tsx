import { useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { usePositionsData, PositionsTable } from '../';
import type { AgGridReact } from 'ag-grid-react';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';

interface PositionsManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
}

export const PositionsManager = ({
  partyId,
  onMarketClick,
  isReadOnly,
}: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
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
  return (
    <div className="h-full relative">
      <PositionsTable
        rowData={error ? [] : data}
        ref={gridRef}
        onMarketClick={onMarketClick}
        onClose={onClose}
        noRowsOverlayComponent={() => null}
        isReadOnly={isReadOnly}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No positions')}
          noDataCondition={(data) => !(data && data.length)}
          reload={reload}
        />
      </div>
    </div>
  );
};
