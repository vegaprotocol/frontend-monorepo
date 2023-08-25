import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { StopOrdersManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';

export const StopOrdersContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
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
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      gridProps={gridStoreCallbacks}
    />
  );
};

const useStopOrdersStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_stop_orders_store',
  })
);
