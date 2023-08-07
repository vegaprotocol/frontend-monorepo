import { act, render, waitFor } from '@testing-library/react';
import {
  useDataGridEvents,
  GRID_EVENT_DEBOUNCE_TIME,
} from './use-datagrid-events';
import { AgGridThemed } from './ag-grid/ag-grid-lazy-themed';
import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';

const gridProps = {
  rowData: [{ id: 1 }],
  columnDefs: [
    {
      field: 'id',
      width: 100,
      filter: 'agNumberColumnFilter',
    },
  ],
  style: { width: 500, height: 300 },
};

// Not using render hook so I can pass event callbacks
// to a rendered grid
function setup(...args: Parameters<typeof useDataGridEvents>) {
  let gridRef;

  function TestComponent() {
    const hookCallbacks = useDataGridEvents(...args);
    gridRef = useRef<AgGridReact | null>(null);
    return <AgGridThemed gridRef={gridRef} {...gridProps} {...hookCallbacks} />;
  }
  render(<TestComponent />);
  return gridRef as unknown as MutableRefObject<AgGridReact>;
}

describe('useDataGridEvents', () => {
  const originalWarn = console.warn;

  beforeAll(() => {
    jest.useFakeTimers();

    // disabling some ag grid warnings that are caused by test setup only
    console.warn = () => undefined;
  });

  afterAll(() => {
    jest.useRealTimers();
    console.warn = originalWarn;
  });

  it('default state is set and callback is called on column or filter event', async () => {
    const callback = jest.fn();
    const initialState = {
      filterModel: undefined,
      columnState: undefined,
    };

    const result = setup(initialState, callback);

    // column state was not updated, so the default width provided by the
    // col def should be set
    expect(result.current.columnApi.getColumnState()[0].width).toEqual(
      gridProps.columnDefs[0].width
    );
    // no filters set
    expect(result.current.api.getFilterModel()).toEqual({});

    const newWidth = 400;

    // Set col width
    await act(async () => {
      result.current.columnApi.setColumnWidth('id', newWidth);
    });

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledWith({
      columnState: [expect.objectContaining({ colId: 'id', width: newWidth })],
      filterModel: {},
    });
    callback.mockClear();
    expect(result.current.columnApi.getColumnState()[0].width).toEqual(
      newWidth
    );

    // Set filter
    await act(async () => {
      result.current.columnApi.applyColumnState({
        state: [{ colId: 'id', sort: 'asc' }],
        applyOrder: true,
      });
    });

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledWith({
      columnState: [expect.objectContaining({ colId: 'id', sort: 'asc' })],
      filterModel: {},
    });
    callback.mockClear();
    expect(result.current.columnApi.getColumnState()[0].sort).toEqual('asc');

    // Set filter
    const idFilter = {
      filter: 1,
      filterType: 'number',
      type: 'equals',
    };
    await act(async () => {
      result.current.api.setFilterModel({
        id: idFilter,
      });
    });

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledWith({
      columnState: expect.any(Object),
      filterModel: {
        id: idFilter,
      },
    });
    callback.mockClear();
    expect(result.current.api.getFilterModel()['id']).toEqual(idFilter);
  });

  it('applies grid state on ready', async () => {
    const idFilter = {
      filter: 1,
      filterType: 'number',
      type: 'equals',
    };
    const colState = { colId: 'id', width: 300, sort: 'desc' as const };
    const initialState = {
      filterModel: {
        id: idFilter,
      },
      columnState: [colState],
    };

    const result = setup(initialState, jest.fn());

    await waitFor(() => {
      expect(result.current.api.getFilterModel()['id']).toEqual(idFilter);
      expect(result.current.columnApi.getColumnState()[0]).toEqual(
        expect.objectContaining(colState)
      );
    });
  });

  it('debounces events', async () => {
    const callback = jest.fn();
    const initialState = {
      filterModel: undefined,
      columnState: undefined,
    };

    const result = setup(initialState, callback);

    const newWidth = 400;

    // Set col width multiple times
    await act(async () => {
      result.current.columnApi.setColumnWidth('id', newWidth);
      result.current.columnApi.setColumnWidth('id', newWidth);
      result.current.columnApi.setColumnWidth('id', newWidth);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
