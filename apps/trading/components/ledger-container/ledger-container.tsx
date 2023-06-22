import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { LedgerManager } from '@vegaprotocol/ledger';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const LedgerContainer = () => {
  const { pubKey } = useVegaWallet();

  const gridStore = useLedgerStore((store) => store.gridStore);
  const updateGridStore = useLedgerStore((store) => store.updateGridStore);

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

  return <LedgerManager partyId={pubKey} gridProps={gridStoreCallbacks} />;
};

const useLedgerStore = create<DataGridSlice>()(
  persist(
    (...args) => ({
      ...createDataGridSlice(...args),
    }),
    {
      name: 'vega_ledger_store',
    }
  )
);
