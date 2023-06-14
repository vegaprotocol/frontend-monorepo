import { useCallback } from 'react';
import { PositionsTable } from './positions-table';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  positionsMetricsProvider,
  positionsMarketsProvider,
} from './positions-data-providers';
import type { useDataGridStore } from '@vegaprotocol/datagrid';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface PositionsManagerProps {
  partyIds: string[];
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
  gridProps: ReturnType<typeof useDataGridStore>;
}

export const PositionsManager = ({
  partyIds,
  onMarketClick,
  isReadOnly,
  gridProps,
}: PositionsManagerProps) => {
  const { pubKeys, pubKey } = useVegaWallet();
  const create = useVegaTransactionStore((store) => store.create);
  const onClose = useCallback(
    ({ marketId, openVolume }: { marketId: string; openVolume: string }) =>
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
      }),
    [create]
  );

  const { data: marketIds } = useDataProvider({
    dataProvider: positionsMarketsProvider,
    variables: { partyIds },
  });

  const { data, error } = useDataProvider({
    dataProvider: positionsMetricsProvider,
    variables: { partyIds, marketIds: marketIds || [] },
    skip: !marketIds,
  });

  return (
    <div className="h-full relative">
      <PositionsTable
        pubKey={pubKey}
        pubKeys={pubKeys}
        rowData={error ? [] : data}
        onMarketClick={onMarketClick}
        onClose={onClose}
        isReadOnly={isReadOnly}
        multipleKeys={partyIds.length > 1}
        overlayNoRowsTemplate={error ? error.message : t('No positions')}
        {...gridProps}
      />
    </div>
  );
};
