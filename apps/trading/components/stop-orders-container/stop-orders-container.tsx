import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { StopOrdersManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { useT } from '../../lib/use-t';
import { useShowCurrentMarketOnly } from '../../lib/hooks/use-show-current-market-only';

export const StopOrdersContainer = ({ marketId }: { marketId?: string }) => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();
  const showCurrentMarketOnly = useShowCurrentMarketOnly();
  const onMarketClick = useMarketClickHandler(true);

  const gridStore = useStopOrdersStore((store) => store.gridStore);
  const updateGridStore = useStopOrdersStore((store) => store.updateGridStore);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <StopOrdersManager
      partyId={pubKey}
      marketId={showCurrentMarketOnly ? marketId : undefined}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      gridProps={gridStoreCallbacks}
    />
  );
};

export const useStopOrdersStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_stop_orders_store',
  })
);
