import type { GridApi, ColumnApi } from 'ag-grid-community';
import { addSummaryRows } from './summary-rows';

type RowMock = { group: string; count: string };

const getGroupId = jest.fn();
getGroupId.mockImplementation(
  (data: { group: string; __summaryRow: boolean }) =>
    data.__summaryRow ? null : data.group
);
const getGroupSummaryRow = jest.fn();
getGroupSummaryRow.mockImplementation(
  (data: RowMock[]): Partial<RowMock> | null => {
    if (!data.length) {
      return null;
    }
    const row: Partial<RowMock> = {
      count: data.reduce((a, c) => a + parseFloat(c.count), 0).toString(),
    };
    return row;
  }
);

const api = {
  forEachNodeAfterFilterAndSort: jest.fn(),
  applyTransactionAsync: jest.fn(),
};

const columnsApi = {};

describe('addSummaryRows', () => {
  it('should render search input and button', () => {
    const nodes = [
      { data: { group: 'a', count: 10 } },
      { data: { group: 'a', count: 10, __summaryRow: true } },
      { data: { group: 'a', count: 20 } },
      { data: { group: 'b', count: 30 } },
      { data: { group: 'c', count: 40 } },
      { data: { group: 'c', count: 50 } },
      { data: { group: 'c', count: 60 } },
      { data: { group: 'd', count: 10, __summaryRow: true } },
      { data: { group: 'd', count: 70 } },
      { data: { group: 'd', count: 80 } },
    ];
    api.forEachNodeAfterFilterAndSort.mockImplementationOnce(
      nodes.forEach.bind(nodes)
    );
    addSummaryRows(
      api as unknown as GridApi,
      columnsApi as unknown as ColumnApi,
      getGroupId,
      getGroupSummaryRow
    );
    expect(api.forEachNodeAfterFilterAndSort).toBeCalledTimes(1);
    expect(api.applyTransactionAsync).toBeCalledTimes(5);
    expect(api.applyTransactionAsync).toHaveBeenNthCalledWith(1, {
      remove: [nodes[1].data],
    });
    expect(api.applyTransactionAsync).toHaveBeenNthCalledWith(2, {
      add: [{ count: '30' }],
      addIndex: 2,
    });
    expect(api.applyTransactionAsync).toHaveBeenNthCalledWith(3, {
      remove: [nodes[7].data],
    });
    expect(api.applyTransactionAsync).toHaveBeenNthCalledWith(4, {
      add: [{ count: '150' }],
      addIndex: 7,
    });
    expect(api.applyTransactionAsync).toHaveBeenNthCalledWith(5, {
      add: [{ count: '150' }],
      addIndex: 10,
    });
  });
});
