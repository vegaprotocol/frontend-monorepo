import { useDataGridStore } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import type { Filter } from '@vegaprotocol/orders';
import { OrderListManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ColumnState } from 'ag-grid-community';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface OrderListContainerProps {
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onOrderTypeClick?: (marketId: string, metaKey?: boolean) => void;
  filter?: Filter;
}

export const OrdersContainer = ({
  marketId,
  onMarketClick,
  onOrderTypeClick,
  filter,
}: OrderListContainerProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const [gridStore, update] = useOrderListStore((store) => [
    store.gridStore,
    store.update,
  ]);
  const gridStoreCallbacks = useDataGridStore(gridStore, (colState) => {
    update(colState);
  });

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <OrderListManager
      partyId={pubKey}
      marketId={marketId}
      filter={filter}
      onMarketClick={onMarketClick}
      onOrderTypeClick={onOrderTypeClick}
      isReadOnly={isReadOnly}
      gridProps={gridStoreCallbacks}
    />
  );
};
type Store = {
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};
const useOrderListStore = create<{
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
      name: 'vega_order_list_store',
    }
  )
);
