import { useCallback } from 'react';
import { PositionsTable } from './positions-table';
import * as Schema from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  positionsMetricsProvider,
  positionsMarketsProvider,
} from './positions-data-providers';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { MAXGOINT64 } from '@vegaprotocol/utils';

interface PositionsManagerProps {
  partyIds: string[];
  onMarketClick?: (marketId: string) => void;
  isReadOnly: boolean;
  gridProps?: ReturnType<typeof useDataGridEvents>;
  showClosed?: boolean;
}

export const PositionsManager = ({
  partyIds,
  onMarketClick,
  isReadOnly,
  gridProps,
  showClosed = false,
}: PositionsManagerProps) => {
  const { pubKeys, pubKey } = useVegaWallet();
  const create = useVegaTransactionStore((store) => store.create);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              size: MAXGOINT64, // improvement for avoiding leftovers filled in the meantime when close request has been sent
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
    variables: { partyIds, marketIds: marketIds || [], showClosed },
    skip: !marketIds,
  });

  return (
    <PositionsTable
      pubKey={pubKey}
      pubKeys={pubKeys}
      rowData={data}
      onMarketClick={onMarketClick}
      // onClose={onClose}
      isReadOnly={isReadOnly}
      multipleKeys={partyIds.length > 1}
      overlayNoRowsTemplate={error ? error.message : t('No positions')}
      {...gridProps}
    />
  );
};
