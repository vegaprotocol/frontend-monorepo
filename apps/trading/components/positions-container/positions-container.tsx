import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { PositionsManager } from '@vegaprotocol/positions';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import type { StateCreator } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';

const AUTO_SIZE_COLUMNS = ['marketCode'];

export const PositionsContainer = ({ allKeys }: { allKeys?: boolean }) => {
  const onMarketClick = useMarketClickHandler(true);
  const { pubKey, pubKeys, isReadOnly } = useVegaWallet();

  const showClosed = usePositionsStore((store) => store.showClosedMarkets);
  const gridStore = usePositionsStore((store) => store.gridStore);
  const updateGridStore = usePositionsStore((store) => store.updateGridStore);
  const gridStoreCallbacks = useDataGridEvents(
    gridStore,
    updateGridStore,
    AUTO_SIZE_COLUMNS
  );

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  const partyIds = [pubKey];
  if (allKeys && pubKeys) {
    partyIds.push(
      ...pubKeys
        .map(({ publicKey }) => publicKey)
        .filter((publicKey) => publicKey !== pubKey)
    );
  }

  return (
    <PositionsManager
      partyIds={partyIds}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      gridProps={gridStoreCallbacks}
      showClosed={showClosed}
    />
  );
};

type PositionsStoreSlice = {
  showClosedMarkets: boolean;
  toggleClosedMarkets: () => void;
};

const createPositionStoreSlice: StateCreator<PositionsStoreSlice> = (set) => ({
  showClosedMarkets: false,
  toggleClosedMarkets: () => {
    set((curr) => {
      return {
        showClosedMarkets: !curr.showClosedMarkets,
      };
    });
  },
});

export const usePositionsStore = create<PositionsStoreSlice & DataGridSlice>()(
  persist(
    (...args) => ({
      ...createPositionStoreSlice(...args),
      ...createDataGridSlice(...args),
    }),
    {
      name: 'vega_positions_store',
    }
  )
);
