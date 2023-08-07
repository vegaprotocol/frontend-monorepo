import debounce from 'lodash/debounce';
import type {
  ColumnResizedEvent,
  ColumnState,
  FilterChangedEvent,
  GridReadyEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { useCallback, useMemo } from 'react';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

type Event = FilterChangedEvent | SortChangedEvent;

export const GRID_EVENT_DEBOUNCE_TIME = 300;

export const useDataGridEvents = (
  state: State,
  callback: (data: State) => void
) => {
  // This function can be called very frequently by the onColumnResized
  // grid callback, so its memoized to only update after resizing is finished
  const onGridChange = useMemo(
    () =>
      debounce(({ api, columnApi }: Event) => {
        if (!api || !columnApi) return;
        const columnState = columnApi.getColumnState();
        const filterModel = api.getFilterModel();
        callback({ columnState, filterModel });
      }, GRID_EVENT_DEBOUNCE_TIME),
    [callback]
  );

  // This function can be called very frequently by the onColumnResized
  // grid callback, so its memoized to only update after resizing is finished
  const onColumnResized = ({
    columnApi,
    source,
    finished,
  }: ColumnResizedEvent) => {
    if (!finished || !columnApi) return;

    // dont store unless the user reszied manually
    if (source !== 'uiColumnResized') return;

    const columnState = columnApi.getColumnState();
    callback({ columnState });
  };

  // check if we have stored column states or filter models and apply if we do
  const onGridReady = useCallback(
    ({ api, columnApi }: GridReadyEvent) => {
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
    onGridReady,
    onColumnResized,
    onFilterChanged: onGridChange,
    onSortChanged: onGridChange,
  };
};
