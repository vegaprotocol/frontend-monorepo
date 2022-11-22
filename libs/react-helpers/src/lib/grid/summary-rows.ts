import type { ColumnApi, GridApi } from 'ag-grid-community';

export interface SummaryRow {
  __summaryRow?: boolean;
}

export function addSummaryRows<T extends SummaryRow>(
  api: GridApi,
  columnApi: ColumnApi,
  getGroupId: (data: T, columnApi: ColumnApi) => string | null | undefined,
  getGroupSummaryRow: (data: T[], columnApi: ColumnApi) => Partial<T> | null
) {
  let currentGroupId: string | null | undefined = undefined;
  let group: T[] = [];
  let addIndex = 0;
  api.forEachNodeAfterFilterAndSort((node) => {
    const nodeGroupId = getGroupId(node.data, columnApi);
    if (currentGroupId === undefined) {
      currentGroupId = nodeGroupId;
    }
    if (node.data.__summaryRow) {
      api.applyTransactionAsync({
        remove: [node.data],
      });
      addIndex -= 1;
    } else if (currentGroupId !== undefined && currentGroupId !== nodeGroupId) {
      if (group.length > 1) {
        api.applyTransactionAsync({
          add: [getGroupSummaryRow(group, columnApi)],
          addIndex,
        });
        addIndex += 1;
      }
      group = [node.data];
      currentGroupId = nodeGroupId;
    } else if (currentGroupId) {
      group.push(node.data);
    }
    addIndex += 1;
  });
  if (group.length > 1) {
    api.applyTransactionAsync({
      add: [getGroupSummaryRow(group, columnApi)],
      addIndex,
    });
  }
}
