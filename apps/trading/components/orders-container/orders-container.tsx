import { useDataGridEvents } from '@vegaprotocol/datagrid';
import { Filter, OrderListManager } from '@vegaprotocol/orders';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useNavigateWithMeta } from '../../lib/hooks/use-market-click-handler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { OrderStatus } from '@vegaprotocol/types';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import { GridSettings } from '../grid-settings/grid-settings';

const resolveNoRowsMessage = (
  filter: Filter | undefined,
  t: ReturnType<typeof useT>
) => {
  switch (filter) {
    case Filter.Open:
      return t('No open orders');
    case Filter.Inactive:
      return t('No order history');
    default:
      return t('No orders');
  }
};

export const FilterStatusValue = {
  [Filter.Open]: [OrderStatus.STATUS_ACTIVE, OrderStatus.STATUS_PARKED],
  [Filter.Inactive]: [
    OrderStatus.STATUS_CANCELLED,
    OrderStatus.STATUS_EXPIRED,
    OrderStatus.STATUS_FILLED,
    OrderStatus.STATUS_PARTIALLY_FILLED,
    OrderStatus.STATUS_STOPPED,
    OrderStatus.STATUS_REJECTED,
  ],
};

export const DefaultFilterModel = {
  [Filter.Open]: {
    status: {
      value: FilterStatusValue[Filter.Open],
    },
  },
  [Filter.Inactive]: {
    status: {
      value: FilterStatusValue[Filter.Inactive],
    },
  },
};

export interface OrderContainerProps {
  filter?: Filter;
}

const AUTO_SIZE_COLUMNS = ['instrument-code'];

export const OrdersContainer = ({ filter }: OrderContainerProps) => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();
  const navigate = useNavigateWithMeta();
  const { gridState, updateGridState } = useOrderListGridState(filter);
  const gridStoreCallbacks = useDataGridEvents(
    gridState,
    (newState) => {
      updateGridState(filter, newState);
    },
    AUTO_SIZE_COLUMNS,
    filter && DefaultFilterModel[filter]
  );

  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  const noRowsMessage = resolveNoRowsMessage(filter, t);

  return (
    <OrderListManager
      partyId={pubKey}
      filter={filter}
      onMarketClick={(marketId, metaKey) => {
        navigate(Links.MARKET(marketId), metaKey);
      }}
      onOrderTypeClick={(marketId, metaKey) =>
        navigate(Links.LIQUIDITY(marketId), metaKey)
      }
      isReadOnly={isReadOnly}
      gridProps={gridStoreCallbacks}
      noRowsMessage={noRowsMessage}
    />
  );
};

export const STORAGE_KEY = 'vega_order_list_store';
export const useOrderListStore = create<{
  open: DataGridStore;
  inactive: DataGridStore;
  all: DataGridStore;
  update: (filter: Filter | undefined, gridStore: DataGridStore) => void;
}>()(
  persist(
    (set) => ({
      open: {},
      inactive: {},
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
          case Filter.Inactive: {
            set((curr) => ({
              inactive: {
                ...curr.inactive,
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
      name: STORAGE_KEY,
    }
  )
);

export const useOrderListGridState = (filter: Filter | undefined) => {
  const updateGridState = useOrderListStore((store) => store.update);
  const gridState = useOrderListStore((store) => {
    // Return the column/filter state for the given filter but ensuring that
    // each filter controlled by the tab is always applied
    switch (filter) {
      case Filter.Open: {
        return {
          columnState: store.open.columnState,
          filterModel: store.open.filterModel,
        };
      }
      case Filter.Inactive: {
        return {
          columnState: store.inactive.columnState,
          filterModel: store.inactive.filterModel,
        };
      }
      default: {
        return store.all;
      }
    }
  });

  return { gridState, updateGridState };
};

export const OrdersSettings = ({ filter }: { filter?: Filter }) => {
  const updateGridState = useOrderListStore((state) => state.update);
  return (
    <GridSettings
      updateGridStore={(gridStore: DataGridStore) =>
        updateGridState(filter, gridStore)
      }
    />
  );
};
