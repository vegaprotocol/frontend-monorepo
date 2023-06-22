import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { Filter } from '@vegaprotocol/orders';
import { OrderListManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ColumnState } from 'ag-grid-community';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderContainerProps {
  marketId?: string;
  filter?: Filter;
}

export const OrdersContainer = ({ marketId, filter }: OrderContainerProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const onMarketClick = useMarketClickHandler(true);
  const onOrderTypeClick = useMarketLiquidityClickHandler();
  const [gridStore, update] = useOrderListStore((store) => {
    switch (filter) {
      case Filter.Open: {
        return [store.open, store.update];
      }
      case Filter.Closed: {
        return [store.closed, store.update];
      }
      case Filter.Rejected: {
        return [store.rejected, store.update];
      }
      default: {
        return [store.all, store.update];
      }
    }
  });
  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    update(filter, colState);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

const useOrderListStore = create<{
  open: Store;
  closed: Store;
  rejected: Store;
  all: Store;
  update: (filter: Filter | undefined, gridStore: Store) => void;
}>()(
  persist(
    (set) => ({
      open: {},
      closed: {},
      rejected: {},
      all: {},
      update: (filter, newStore) => {
        switch (filter) {
          case Filter.Open: {
            set((curr) => ({
              open: {
                ...curr.open,
                ...newStore,
              },
            }));
            return;
          }
          case Filter.Closed: {
            set((curr) => ({
              closed: {
                ...curr.closed,
                ...newStore,
              },
            }));
            return;
          }
          case Filter.Rejected: {
            set((curr) => ({
              rejected: {
                ...curr.rejected,
                ...newStore,
              },
            }));
            return;
          }
          case undefined: {
            set((curr) => ({
              all: {
                ...curr.all,
                ...newStore,
              },
            }));
            return;
          }
        }
      },
    }),
    {
      name: 'vega_order_list_store',
    }
  )
);
