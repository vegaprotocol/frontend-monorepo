import {
  type ColumnMovedEvent,
  type ColumnResizedEvent,
  type ColumnState,
  type ColumnVisibleEvent,
  type FilterChangedEvent,
  type FirstDataRenderedEvent,
  type SortChangedEvent,
  type GridReadyEvent,
  GridApi,
} from 'ag-grid-community';
import { useCallback, useEffect, useRef } from 'react';

type State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

export const useDataGridEvents = (
  state: State,
  callback: (data: State) => void,
  autoSizeColumns?: string[],
  defaultFilterModel?: State['filterModel']
) => {
  const apiRef = useRef<GridApi | undefined>();

  useEffect(() => {
    if (apiRef.current?.isDestroyed()) {
      apiRef.current = undefined;
    }
    if (apiRef.current) {
      if (!state.columnState) {
        apiRef.current.resetColumnState();
      }
      if (!state.filterModel) {
        apiRef.current.setFilterModel(defaultFilterModel);
      }
    }
  }, [state, defaultFilterModel]);

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
    ({ api, source, finished }: ColumnResizedEvent | ColumnMovedEvent) => {
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

      const columnState = api.getColumnState();

      callback({ columnState });
    },
    [callback]
  );

  /**
   * Callback for sort and visible events
   */
  const onColumnChange = useCallback(
    ({ api }: SortChangedEvent | ColumnVisibleEvent) => {
      const columnState = api.getColumnState();
      callback({ columnState });
    },
    [callback]
  );

  /**
   * Callback for grid startup to apply stored column and filter states.
   * State only applied if found, otherwise columns sized to fit available space
   */
  const onGridReady = useCallback(
    ({ api }: GridReadyEvent) => {
      apiRef.current = api;
      if (!api) return;
      if (state.columnState) {
        api.applyColumnState({
          state: state.columnState,
          applyOrder: true,
        });
      } else {
        api.sizeColumnsToFit();
      }

      if (state.filterModel || defaultFilterModel) {
        api.setFilterModel({ ...state.filterModel, ...defaultFilterModel });
      }
    },
    [state, defaultFilterModel]
  );

  const onFirstDataRendered = useCallback(
    ({ api }: FirstDataRenderedEvent) => {
      if (!api) return;
      if (!state?.columnState && autoSizeColumns?.length) {
        api.autoSizeColumns(autoSizeColumns);
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
