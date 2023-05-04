import type { MutableRefObject, ReactElement } from 'react';
import type { Column } from 'ag-grid-community';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { renderHook } from '@testing-library/react';
import { useColumnSizes } from './use-column-sizes';

const mockValueSetter = jest.fn();
let mockStore = { sizes: {}, valueSetter: mockValueSetter };
jest.mock('zustand', () => ({
  ...jest.requireActual('zustand'),
  create: () =>
    jest.fn(() =>
      jest.fn().mockImplementation((creator) => {
        return creator(mockStore);
      })
    ),
}));
describe('UseColumnsSizes hook', () => {
  const id = 'testid';
  const container = {
    current: { getBoundingClientRect: () => ({ width: 1000 }) },
  } as MutableRefObject<HTMLDivElement>;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should return proper methods', () => {
    const { result } = renderHook(() => useColumnSizes({ id, container }));
    expect(result.current).toHaveLength(3);
    expect(result.current).toStrictEqual([
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it('handleOnChange should fill up store', () => {
    jest.useFakeTimers();
    const columns: Column[] = [
      { getColId: () => 'col1', getActualWidth: () => 100 },
      { getColId: () => 'col2', getActualWidth: () => 200 },
    ] as Column[];
    const sizeObj = { col1: 100, col2: 200, width: 1000 };
    const { result } = renderHook(() => useColumnSizes({ id, container }));
    result.current[0](columns);
    jest.runAllTimers();
    expect(mockValueSetter).toHaveBeenCalledWith(id, sizeObj);
  });

  it('children should be reshaped', () => {
    mockStore = {
      sizes: { [id]: { col1: 100, col2: 200, width: 1000 } },
      valueSetter: mockValueSetter,
    };
    const children = [
      { props: { colId: 'col1' } },
      { props: { colId: 'col2' } },
    ] as ReactElement[];
    const { result } = renderHook(() => useColumnSizes({ id, container }));
    expect(result.current[1](children)).toStrictEqual([
      { props: { colId: 'col1', width: 100 } },
      { props: { colId: 'col2', width: 200 } },
    ]);
  });

  it('props should be reshaped', () => {
    mockStore = {
      sizes: { [id]: { col1: 100, col2: 200, width: 1000 } },
      valueSetter: mockValueSetter,
    };
    const props = { columnDefs: [{ colId: 'col1' }, { colId: 'col2' }] } as
      | AgGridReactProps
      | AgReactUiProps;
    const { result } = renderHook(() => useColumnSizes({ id, container }));
    expect(result.current[2](props, undefined)).toStrictEqual({
      columnDefs: [
        { colId: 'col1', width: 100 },
        { colId: 'col2', width: 200 },
      ],
    });
  });
});
