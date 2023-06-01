import { useRef } from 'react';
import { usePositionsData } from './use-positions-data';
import { PositionsTable } from './positions-table';
import type { AgGridReact } from 'ag-grid-react';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface PositionsManagerProps {
  partyIds: string[];
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
  noBottomPlaceholder?: boolean;
  storeKey?: string;
}

export const PositionsManager = ({
  partyIds,
  onMarketClick,
  isReadOnly,
  noBottomPlaceholder,
  storeKey,
}: PositionsManagerProps) => {
  const { pubKeys, pubKey } = useVegaWallet();
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error } = usePositionsData(partyIds, gridRef);
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

  const bottomPlaceholderProps = useBottomPlaceholder({
    gridRef,
    disabled: noBottomPlaceholder,
  });

  return (
    <div className="h-full relative">
      <PositionsTable
        pubKey={pubKey}
        pubKeys={pubKeys}
        rowData={error ? [] : data}
        ref={gridRef}
        onMarketClick={onMarketClick}
        onClose={onClose}
        isReadOnly={isReadOnly}
        {...bottomPlaceholderProps}
        storeKey={storeKey}
        multipleKeys={partyIds.length > 1}
        overlayNoRowsTemplate={error ? error.message : t('No positions')}
      />
    </div>
  );
};
