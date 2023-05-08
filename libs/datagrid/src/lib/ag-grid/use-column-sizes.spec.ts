import type {
  Column,
  ColumnResizedEvent,
  GridSizeChangedEvent,
} from 'ag-grid-community';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useColumnSizes } from './use-column-sizes';

const mockApis = {
  api: {
    sizeColumnsToFit: jest.fn(),
  },
  columnApi: {
    setColumnWidths: jest.fn(),
  },
};

const mockValueSetter = jest.fn();
const mockStore = {
  sizes: { testid: { col1: 100 } },
  valueSetter: mockValueSetter,
};
jest.mock('zustand', () => ({
  ...jest.requireActual('zustand'),
  create: () =>
    jest.fn(() =>
      jest.fn().mockImplementation((creator) => {
        return creator(mockStore);
      })
    ),
}));
describe('UseColumnSizes hook', () => {
  const storeKey = 'testid';

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should return proper methods', () => {
    const { result } = renderHook(() =>
      useColumnSizes({ storeKey, props: {} })
    );
    expect(Object.keys(result.current)).toHaveLength(3);
    expect(result.current).toStrictEqual({
      onColumnResized: expect.any(Function),
      onGridReady: expect.any(Function),
      onGridSizeChanged: expect.any(Function),
    });
  });

  it('handleOnChange should fill up store', async () => {
    const columns: Column[] = [
      { getColId: () => 'col1', getActualWidth: () => 100 },
      { getColId: () => 'col2', getActualWidth: () => 200 },
    ] as Column[];
    const sizeObj = { col1: 100, col2: 200, clientWidth: 1000 };
    const { result } = renderHook(() =>
      useColumnSizes({ storeKey, props: {} })
    );
    await act(() => {
      result.current.onGridSizeChanged({
        clientWidth: 1000,
        ...mockApis,
      } as GridSizeChangedEvent);
    });
    await act(() => {
      result.current.onColumnResized({
        columns,
        finished: true,
        source: 'uiColumnDragged',
        ...mockApis,
      } as ColumnResizedEvent);
    });
    await waitFor(() => {
      expect(mockValueSetter).toHaveBeenCalledWith(storeKey, sizeObj);
    });
  });
});
