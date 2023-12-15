import { act, render, waitFor } from '@testing-library/react';
import { useDataGridEvents } from './use-datagrid-events';
import { AgGridThemed } from './ag-grid/ag-grid-themed';
import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import { type AgGridReact } from 'ag-grid-react';

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
const GRID_EVENT_DEBOUNCE_TIME = 300;
let gridRef: MutableRefObject<AgGridReact | null> | undefined;
function TestComponent({
  hookParams,
}: {
  hookParams: Parameters<typeof useDataGridEvents>;
}) {
  const hookCallbacks = useDataGridEvents(...hookParams);
  gridRef = useRef<AgGridReact | null>(null);
  return <AgGridThemed gridRef={gridRef} {...gridProps} {...hookCallbacks} />;
}

// Not using render hook so I can pass event callbacks
// to a rendered grid
function setup(...args: Parameters<typeof useDataGridEvents>) {
  return render(<TestComponent hookParams={args} />);
}

describe('useDataGridEvents', () => {
  const originalWarn = console.warn;

  beforeAll(() => {
    gridRef = undefined;
    jest.useFakeTimers();

    // disabling some ag grid warnings that are caused by test setup only
    console.warn = () => undefined;
  });

  afterAll(() => {
    jest.useRealTimers();
    console.warn = originalWarn;
  });

  it('default state is set and callback is called on filter event', async () => {
    const callback = jest.fn();
    const initialState = {
      filterModel: undefined,
      columnState: undefined,
    };

    setup(initialState, callback);

    // column state was not updated, so the default width provided by the
    // col def should be set
    expect(gridRef?.current?.api.getColumnState()[0].width).toEqual(
      gridProps.columnDefs[0].width
    );
    // no filters set
    expect(gridRef?.current?.api.getFilterModel()).toEqual({});

    // Set filter
    const idFilter = {
      filter: 1,
      filterType: 'number',
      type: 'equals',
    };
    await act(async () => {
      gridRef?.current?.api.setFilterModel({
        id: idFilter,
      });
    });

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledWith({
      columnState: undefined,
      filterModel: {
        id: idFilter,
      },
    });
    callback.mockClear();
    expect(gridRef?.current?.api.getFilterModel()['id']).toEqual(idFilter);
  });

  it('applies grid state on ready', async () => {
    const idFilter = {
      filter: 1,
      filterType: 'number',
      type: 'equals',
    };
    const colState = { colId: 'id', sort: 'desc' as const };
    const initialState = {
      filterModel: {
        id: idFilter,
      },
      columnState: [colState],
    };

    setup(initialState, jest.fn());

    await waitFor(() => {
      expect(gridRef?.current?.api.getFilterModel()['id']).toEqual(idFilter);
      expect(gridRef?.current?.api.getColumnState()[0]).toEqual(
        expect.objectContaining(colState)
      );
    });
  });

  it('ignores events that were not made via the UI', async () => {
    const callback = jest.fn();
    const initialState = {
      filterModel: undefined,
      columnState: undefined,
    };

    setup(initialState, callback);

    const newWidth = 400;

    // Set col width multiple times
    await act(async () => {
      gridRef?.current?.api.setColumnWidth('id', newWidth);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });

    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('columns for autosizing should be handle', () => {
    const callback = jest.fn();
    const initialState = {
      filterModel: undefined,
      columnState: undefined,
    };

    const { rerender } = setup(initialState, callback, ['id']);
    if (gridRef?.current?.api) {
      jest.spyOn(gridRef?.current?.api, 'autoSizeColumns');
    }
    rerender(<TestComponent hookParams={[initialState, callback, ['id']]} />);
    act(() => {
      gridRef?.current?.api.setGridOption('rowData', [{ id: 'test-id' }]);
      jest.advanceTimersByTime(GRID_EVENT_DEBOUNCE_TIME);
    });
    expect(gridRef?.current?.api.autoSizeColumns).toHaveBeenCalledWith(['id']);
  });
});
