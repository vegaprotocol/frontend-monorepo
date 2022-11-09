import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useRef, useState } from 'react';
import type {
  BodyScrollEvent,
  BodyScrollEndEvent,
  FilterChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';

import { OrderList } from '../order-list/order-list';
import { useOrderListData } from './use-order-list-data';
import type { Filter, Sort } from './use-order-list-data';

export interface OrderListManagerProps {
  partyId: string;
}

export const OrderListManager = ({ partyId }: OrderListManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const [sort, setSort] = useState<Sort[] | undefined>();
  const [filter, setFilter] = useState<Filter | undefined>();

  const { data, error, loading, addNewRows, getRows } = useOrderListData({
    partyId,
    sort,
    filter,
    gridRef,
    scrolledToTop,
  });

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  const onFilterChanged = (event: FilterChangedEvent) => {
    const updatedFilter = event.api.getFilterModel();
    if (Object.keys(updatedFilter).length) {
      setFilter(updatedFilter);
    } else if (filter) {
      setFilter(undefined);
    }
  };

  const onSortChange = (event: SortChangedEvent) => {
    const sort = event.columnApi
      .getColumnState()
      .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
      .reduce((acc, col) => {
        if (col.sort) {
          const { colId, sort } = col;
          acc.push({ colId, sort });
        }
        return acc;
      }, [] as { colId: string; sort: string }[]);
    setSort(sort.length > 0 ? sort : undefined);
  };

  return (
    <>
      <OrderList
        ref={gridRef}
        rowModelType="infinite"
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onFilterChanged={onFilterChanged}
        onSortChanged={onSortChange}
      />
      <div className="pointer-events-none absolute inset-0 top-5">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={data}
          noDataMessage={t('No orders')}
          noDataCondition={(data) => !(data && data.length)}
        />
      </div>
    </>
  );
};
