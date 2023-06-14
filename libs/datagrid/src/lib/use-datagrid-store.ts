import debounce from 'lodash/debounce';
import type {
  ColumnResizedEvent,
  ColumnState,
  FilterChangedEvent,
  GridColumnsChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { useCallback, useMemo, useRef } from 'react';

type State = {
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

type Event = ColumnResizedEvent | FilterChangedEvent | SortChangedEvent;

export const useDataGridStore = (
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
      }, 300),
    [callback]
  );

  // check if we have stored column states or filter models and apply if we do
  const onGridReady = useCallback(
    ({ api, columnApi }: GridColumnsChangedEvent) => {
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
    onColumnResized: onGridChange,
    onFilterChanged: onGridChange,
    onSortChanged: onGridChange,
  };
};
