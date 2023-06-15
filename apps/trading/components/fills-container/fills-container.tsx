import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { FillsManager } from '@vegaprotocol/fills';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { ColumnState } from 'ag-grid-community';
import { useDataGridEvents } from '@vegaprotocol/datagrid';

export const FillsContainer = ({
  marketId,
  onMarketClick,
}: {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
}) => {
  const { pubKey } = useVegaWallet();

  const [gridStore, update] = useFillsStore((store) => [
    store.gridStore,
    store.update,
  ]);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    update(colState);
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
      marketId={marketId}
      onMarketClick={onMarketClick}
      gridProps={gridStoreCallbacks}
    />
  );
};

type Store = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

const useFillsStore = create<{
  gridStore: Store;
  update: (gridStore: Store) => void;
}>()(
  persist(
    subscribeWithSelector((set) => ({
      gridStore: {},
      update: (newStore) => {
        set((curr) => ({
          gridStore: {
            ...curr.gridStore,
            ...newStore,
          },
        }));
      },
    })),
    {
      name: 'vega_fills_store',
    }
  )
);
