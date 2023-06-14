import { useDataGridStore } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { PositionsManager } from '@vegaprotocol/positions';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ColumnState } from 'ag-grid-community';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export const PositionsContainer = ({
  onMarketClick,
  allKeys,
}: {
  onMarketClick?: (marketId: string) => void;
  allKeys?: boolean;
}) => {
  const { pubKey, pubKeys, isReadOnly } = useVegaWallet();

  const [gridStore, update] = usePositionsStore((store) => [
    store.gridStore,
    store.update,
  ]);
  const gridStoreCallbacks = useDataGridStore(gridStore, (colState) => {
    update(colState);
  });

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
    />
  );
};

type Store = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

const usePositionsStore = create<{
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
      name: 'vega_positions_store',
    }
  )
);
