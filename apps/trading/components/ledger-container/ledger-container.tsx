import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { LedgerManager } from '@vegaprotocol/ledger';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ColumnState } from 'ag-grid-community';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export const LedgerContainer = () => {
  const { pubKey } = useVegaWallet();

  const [gridStore, update] = useLedgerStore((store) => [
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

  return <LedgerManager partyId={pubKey} gridProps={gridStoreCallbacks} />;
};

type Store = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

const useLedgerStore = create<{
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
      name: 'vega_ledger_store',
    }
  )
);
