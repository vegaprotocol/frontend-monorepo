import { GridApi } from 'ag-grid-community';
import { useEffect } from 'react';

export const useApplyGridTransaction = <T extends { id: string }>(
  data: T[],
  gridApi: GridApi | null
) => {
  useEffect(() => {
    if (!gridApi) return;

    const update: T[] = [];
    const add: T[] = [];

    // split into updates and adds
    data.forEach((d) => {
      if (!gridApi) return;

      const rowNode = gridApi.getRowNode(d.id);

      if (rowNode) {
        update.push(d);
      } else {
        add.push(d);
      }
    });

    gridApi.applyTransaction({
      update,
      add,
      addIndex: 0,
    });
  }, [data, gridApi]);
};
