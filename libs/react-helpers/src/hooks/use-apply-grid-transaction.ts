import { GridApi } from 'ag-grid-community';
import { useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { produce } from 'immer';

export const updateCallback =
  <T>(
    gridApiRef: { current: GridApi | null },
    getRowNodeId: (row: T) => string
  ) =>
  (data: T[]) => {
    if (!gridApiRef.current) return;

    const update: T[] = [];
    const add: T[] = [];

    // split into updates and adds
    data.forEach((d) => {
      if (!gridApiRef.current) return;

      const rowNode = gridApiRef.current.getRowNode(getRowNodeId(d));

      if (rowNode) {
        if (
          produce(rowNode.data, (draft: T) => Object.assign(draft, d)) !==
          rowNode.data
        ) {
          update.push(d);
        }
      } else {
        add.push(d);
      }
    });
    // async transaction for optimal handling of high grequency updates
    gridApiRef.current.applyTransactionAsync({
      update,
      add,
      addIndex: 0,
    });
  };

export const useApplyGridTransaction = <T>(
  data: T[],
  gridApi: GridApi | null,
  getRowNodeId: (row: T) => string
) => {
  useEffect(() => {
    if (!gridApi) return;

    const update: T[] = [];
    const add: T[] = [];

    // split into updates and adds
    data.forEach((d) => {
      if (!gridApi) return;

      const rowNode = gridApi.getRowNode(getRowNodeId(d));

      if (rowNode) {
        if (!isEqual(rowNode.data, d)) {
          update.push(d);
        }
      } else {
        add.push(d);
      }
    });
    // async transaction for optimal handling of high grequency updates
    gridApi.applyTransaction({
      update,
      add,
      addIndex: 0,
    });
  }, [data, gridApi, getRowNodeId]);
};
