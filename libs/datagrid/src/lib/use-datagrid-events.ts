import debounce from 'lodash/debounce';
import type {
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnState,
  ColumnVisibleEvent,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { useCallback, useMemo } from 'react';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

type GridEvent = FilterChangedEvent | SortChangedEvent;
type ColEvent = ColumnResizedEvent | ColumnMovedEvent | ColumnVisibleEvent;

export const GRID_EVENT_DEBOUNCE_TIME = 300;

export const useDataGridEvents = (
  state: State,
  callback: (data: State) => void
) => {
  // This function can be called very frequently by the onColumnResized
  // grid callback, so its memoized to only update after resizing is finished
  const onGridChange = useMemo(
    () =>
      debounce(({ api }: GridEvent) => {
        if (!api) return;
        const filterModel = api.getFilterModel();
        callback({ filterModel });
      }, GRID_EVENT_DEBOUNCE_TIME),
    [callback]
  );

  const onColumnChange = useMemo(
    () =>
      debounce(({ api, columnApi }: ColEvent) => {
        if (!api || !columnApi) return;
        const columnState = columnApi.getColumnState();
        callback({ columnState });
      }, GRID_EVENT_DEBOUNCE_TIME),
    [callback]
  );

  // check if we have stored column states or filter models and apply if we do
  const onFirstDataRendered = useCallback(
    ({ api, columnApi }: FirstDataRenderedEvent) => {
      if (!api || !columnApi) return;

      if (state.columnState) {
        columnApi.applyColumnState({
          state: state.columnState,
          applyOrder: true,
        });
      } else {
        // ensure columns fit available space if no widths are set
        columnApi.autoSizeAllColumns();
      }

      if (state.filterModel) {
        api.setFilterModel(state.filterModel);
      }
    },
    [state]
  );

  return {
    onFirstDataRendered,
    onColumnResized: onColumnChange,
    onColumnVisible: onColumnChange,
    onColumnMoved: onColumnChange,
    onFilterChanged: onGridChange,
    onSortChanged: onGridChange,
  };
};
