import type { ColumnState, GridColumnsChangedEvent } from 'ag-grid-community';
import { useCallback } from 'react';

type State = {
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
};

export const useDataGridStore = (
  state: State,
  callback: (data: State) => void
) => {
  // TODO: Debounce this
  const changedCallback = useCallback(
    ({ api, columnApi }: GridColumnsChangedEvent) => {
      if (!api || !columnApi) return;

      const columnState = columnApi.getColumnState();
      const filterModel = api.getFilterModel();
      callback({ columnState, filterModel });
    },
    [callback]
  );

  const onGridReady = useCallback(
    ({ api, columnApi }: GridColumnsChangedEvent) => {
      if (state.columnState) {
        columnApi.applyColumnState({
          state: state.columnState,
          applyOrder: true,
        });
      }
      if (state.filterModel && api) {
        api.setFilterModel(state.filterModel);
      }
    },
    [state]
  );

  return {
    onGridReady,
    onColumnResized: changedCallback,
    onFilterChanged: changedCallback,
    onSortChanged: changedCallback,
  };
};
