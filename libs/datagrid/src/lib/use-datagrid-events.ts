import type {
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnState,
  ColumnVisibleEvent,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { useCallback } from 'react';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

type ColEvent = ColumnResizedEvent | ColumnMovedEvent;

export const useDataGridEvents = (
  state: State,
  callback: (data: State) => void
) => {
  // This function can be called very frequently by the onColumnResized
  // grid callback, so its memoized to only update after resizing is finished
  const onFilterChanged = useCallback(
    ({ api }: FilterChangedEvent) => {
      if (!api) return;
      const filterModel = api.getFilterModel();
      callback({ filterModel });
    },
    [callback]
  );

  const onColumnChange = useCallback(
    ({ columnApi, source, finished }: ColEvent) => {
      if (finished !== undefined && !finished) return;

      // only call back on user interactions
      const permittedEvents = [
        'uiColumnResized',
        'uiColumnDragged',
        'uiColumnMoved',
      ];
      if (!permittedEvents.includes(source)) {
        return;
      }

      const columnState = columnApi.getColumnState();

      callback({ columnState });
    },
    [callback]
  );

  const onSortChanged = useCallback(
    ({ columnApi }: SortChangedEvent) => {
      const columnState = columnApi.getColumnState();
      callback({ columnState });
    },
    [callback]
  );

  const onColumnVisible = useCallback(
    ({ columnApi }: ColumnVisibleEvent) => {
      const columnState = columnApi.getColumnState();
      callback({ columnState });
    },
    [callback]
  );

  // check if we have stored column states or filter models and apply if we do
  const onGridReady = useCallback(
    ({ api, columnApi }: FirstDataRenderedEvent) => {
      if (!api || !columnApi) return;

      if (state.columnState) {
        columnApi.applyColumnState({
          state: state.columnState,
          applyOrder: true,
        });
      } else {
        api.sizeColumnsToFit();
      }

      if (state.filterModel) {
        api.setFilterModel(state.filterModel);
      }
    },
    [state]
  );

  return {
    onGridReady,
    onSortChanged,
    onColumnVisible,
    onFilterChanged,
    onColumnMoved: onColumnChange,
    onColumnResized: onColumnChange,
  };
};
