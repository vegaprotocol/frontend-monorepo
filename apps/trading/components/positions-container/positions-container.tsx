import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { PositionsManager } from '@vegaprotocol/positions';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { DataGridSlice } from '../../stores/datagrid-store-slice';
import { createDataGridSlice } from '../../stores/datagrid-store-slice';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PositionsContainer = ({
  onMarketClick,
  allKeys,
}: {
  onMarketClick?: (marketId: string) => void;
  allKeys?: boolean;
}) => {
  const { pubKey, pubKeys, isReadOnly } = useVegaWallet();

  const gridStore = usePositionsStore((store) => store.gridStore);
  const updateGridStore = usePositionsStore((store) => store.updateGridStore);
  const gridStoreCallbacks = useDataGridEvents(gridStore, updateGridStore);

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

const usePositionsStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_positions_store',
  })
);
