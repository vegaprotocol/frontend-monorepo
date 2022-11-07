import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
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

interface OrderListManagerProps {
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
    setFilter(event.api.getFilterModel() as Filter);
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
    <AsyncRenderer loading={loading} error={error} data={data}>
      <OrderList
        ref={gridRef}
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
        onBodyScrollEnd={onBodyScrollEnd}
        onBodyScroll={onBodyScroll}
        onFilterChanged={onFilterChanged}
        onSortChanged={onSortChange}
      />
    </AsyncRenderer>
  );
};
