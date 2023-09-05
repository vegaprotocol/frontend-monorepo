import { renderHook, waitFor } from '@testing-library/react';
import { useTimeToUpgrade } from './use-time-to-upgrade';

jest.mock('./__generated__/BlockStatistics', () => ({
  ...jest.requireActual('./__generated__/BlockStatistics'),
  useBlockStatisticsQuery: jest.fn(() => {
    return {
      data: {
        statistics: {
          blockHeight: 1,
          blockDuration: 500,
        },
      },
    };
  }),
}));

describe('useTimeToUpgrade', () => {
  it.each([
    [-1, -1000],
    [0, -500],
    [1, 0],
    [2, 500],
    [3, 1000],
    [10, 4500],
  ])('time in %d block(s) should be %d ms', async (block, avg) => {
    const { result } = renderHook(() => useTimeToUpgrade(block, 1));
    await waitFor(() => {
      expect(result.current).toEqual(avg);
    });
  });
});
