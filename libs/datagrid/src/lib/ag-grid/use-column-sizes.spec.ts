import type { MutableRefObject } from 'react';
import type { Column } from 'ag-grid-community';
import { renderHook } from '@testing-library/react';
import { useColumnSizes } from './use-column-sizes';

const mockValueSetter = jest.fn();
const mockStore = { sizes: {}, valueSetter: mockValueSetter };
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
    result.current[1](columns);
    jest.runAllTimers();
    expect(mockValueSetter).toHaveBeenCalledWith(id, sizeObj);
  });
});
