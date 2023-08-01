import { useVegaWallet } from '@vegaprotocol/wallet';
import { FillsManager } from '@vegaprotocol/fills';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDataGridEvents } from '@vegaprotocol/datagrid';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';

export const FillsContainer = ({
  marketId,
  onMarketClick,
}: {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}) => {
  const { pubKey } = useVegaWallet();

  const gridStore = useFillsStore((store) => store.gridStore);
  const updateGridStore = useFillsStore((store) => store.updateGridStore);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });

  if (!pubKey) {
    return null;
  }

  return (
    <FillsManager
      partyId={pubKey}
      marketId={marketId}
      onMarketClick={onMarketClick}
      gridProps={gridStoreCallbacks}
    />
  );
};

const useFillsStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_fills_store',
  })
);
