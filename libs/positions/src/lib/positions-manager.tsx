import { useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { usePositionsData, PositionsTable } from '../';
import type { AgGridReact } from 'ag-grid-react';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/react-helpers';

interface PositionsManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string) => void;
}

export const PositionsManager = ({
  partyId,
  onMarketClick,
}: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error, loading, getRows } = usePositionsData(partyId, gridRef);
  const create = useVegaTransactionStore((store) => store.create);

  return (
    <div className="h-full relative">
      <PositionsTable
        rowModelType="infinite"
        ref={gridRef}
        datasource={{ getRows }}
        onMarketClick={onMarketClick}
        onClose={({ marketId, openVolume }) =>
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
                  timeInForce: Schema.OrderTimeInForce
                    .TIME_IN_FORCE_FOK as const,
                  side: openVolume.startsWith('-')
                    ? Schema.Side.SIDE_BUY
                    : Schema.Side.SIDE_SELL,
                  size: openVolume.replace('-', ''),
                },
              ],
            },
          })
        }
        noRowsOverlayComponent={() => null}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No positions')}
          noDataCondition={(data) => !(data && data.length)}
        />
      </div>
    </div>
  );
};
