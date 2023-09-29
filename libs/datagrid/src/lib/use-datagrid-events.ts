import type {
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnState,
  ColumnVisibleEvent,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  SortChangedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import { useCallback } from 'react';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

export const useDataGridEvents = (
  state: State,
  callback: (data: State) => void,
  autoSizeColumns?: string[]
) => {
  /**
   * Callback for filter events
   */
  const onFilterChanged = useCallback(
    ({ api }: FilterChangedEvent) => {
      if (!api) return;
      const filterModel = api.getFilterModel();
      callback({ filterModel });
    },
    [callback]
  );

  /**
   * Callback for column resized and column moved events, which can be
   * triggered in quick succession. Uses the finished flag to not call the
   * store callback unnecessarily
   */
  const onDebouncedColumnChange = useCallback(
    ({
      columnApi,
      source,
      finished,
    }: ColumnResizedEvent | ColumnMovedEvent) => {
      if (!finished) return;

      // only call back on user interactions, and not events triggered from the api
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

  /**
   * Callback for sort and visible events
   */
  const onColumnChange = useCallback(
    ({ columnApi }: SortChangedEvent | ColumnVisibleEvent) => {
      const columnState = columnApi.getColumnState();
      callback({ columnState });
    },
    [callback]
  );

  /**
   * Callback for grid startup to apply stored column and filter states.
   * State only applied if found, otherwise columns sized to fit available space
   */
  const onGridReady = useCallback(
    ({ api, columnApi }: GridReadyEvent) => {
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

  const onFirstDataRendered = useCallback(
    ({ columnApi }: FirstDataRenderedEvent) => {
      if (!columnApi) return;
      if (!state?.columnState && autoSizeColumns?.length) {
        columnApi.autoSizeColumns(autoSizeColumns);
      }
    },
    [state, autoSizeColumns]
  );

  return {
    onGridReady,
    // these events don't use the 'finished' flag
    onFilterChanged,
    onSortChanged: onColumnChange,
    onColumnVisible: onColumnChange,
    // these trigger a lot so this callback uses the 'finished' flag
    onColumnMoved: onDebouncedColumnChange,
    onColumnResized: onDebouncedColumnChange,
    onFirstDataRendered,
  };
};
