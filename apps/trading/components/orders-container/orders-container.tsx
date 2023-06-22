import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { Filter } from '@vegaprotocol/orders';
import { OrderListManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { OrderStatus } from '@vegaprotocol/types';

const FilterStatusValue = {
  [Filter.Open]: [OrderStatus.STATUS_ACTIVE, OrderStatus.STATUS_PARKED],
  [Filter.Closed]: [
    OrderStatus.STATUS_CANCELLED,
    OrderStatus.STATUS_EXPIRED,
    OrderStatus.STATUS_FILLED,
    OrderStatus.STATUS_PARTIALLY_FILLED,
    OrderStatus.STATUS_STOPPED,
  ],
  [Filter.Rejected]: [OrderStatus.STATUS_REJECTED],
};

export interface OrderContainerProps {
  marketId?: string;
  filter?: Filter;
}

export const OrdersContainer = ({ marketId, filter }: OrderContainerProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const onMarketClick = useMarketClickHandler(true);
  const onOrderTypeClick = useMarketLiquidityClickHandler();
  const gridStore = useOrderListStore((store) => {
    switch (filter) {
      case Filter.Open: {
        return {
          columnState: store.open.columnState,
          filterModel: {
            status: {
              value: FilterStatusValue[Filter.Open],
            },
          },
        };
      }
      case Filter.Closed: {
        return {
          columnState: store.closed.columnState,
          filterModel: {
            status: {
              value: FilterStatusValue[Filter.Closed],
            },
          },
        };
      }
      case Filter.Rejected: {
        return {
          columnState: store.rejected.columnState,
          filterModel: {
            status: {
              value: FilterStatusValue[Filter.Rejected],
            },
          },
        };
      }
      default: {
        return store.all;
      }
    }
  });
  const update = useOrderListStore((store) => store.update);
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

const useOrderListStore = create<{
  open: DataGridStore;
  closed: DataGridStore;
  rejected: DataGridStore;
  all: DataGridStore;
  update: (filter: Filter | undefined, gridStore: DataGridStore) => void;
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
