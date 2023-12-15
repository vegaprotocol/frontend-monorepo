import { TradesManager } from '@vegaprotocol/trades';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDataGridEvents } from '@vegaprotocol/datagrid';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridStore = useTradesStore((store) => store.gridStore);
  const updateGridStore = useTradesStore((store) => store.updateGridStore);
  const gridStoreCallbacks = useDataGridEvents(gridStore, updateGridStore);

  return <TradesManager marketId={marketId} gridProps={gridStoreCallbacks} />;
};

export const useTradesStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_trades_store',
  })
);
