import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { FillsManager } from '@vegaprotocol/fills';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { Splash } from '@vegaprotocol/ui-toolkit';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { useT } from '../../lib/use-t';
import { useShowCurrentMarketOnly } from '../orders-container';

export const FillsContainer = ({ marketId }: { marketId?: string }) => {
  const t = useT();
  const onMarketClick = useMarketClickHandler(true);
  const showCurrentMarketOnly = useShowCurrentMarketOnly();
  const { pubKey } = useVegaWallet();

  const gridStore = useFillsStore((store) => store.gridStore);
  const updateGridStore = useFillsStore((store) => store.updateGridStore);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  return (
    <FillsManager
      partyId={pubKey}
      marketId={showCurrentMarketOnly ? marketId : undefined}
      onMarketClick={onMarketClick}
      gridProps={gridStoreCallbacks}
    />
  );
};

export const useFillsStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_fills_store',
  })
);
