import { renderHook, waitFor } from '@testing-library/react';
import { parseDuration, useTimeToUpgrade } from './use-time-to-upgrade';

jest.mock('./__generated__/BlockStatistics', () => ({
  ...jest.requireActual('./__generated__/BlockStatistics'),
  useBlockStatisticsQuery: jest.fn(() => {
    return {
      data: {
        statistics: {
          blockHeight: 1,
          blockDuration: '500ms',
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

describe('parseDuration', () => {
  it.each([
    ['1000000ns', 1],
    ['1000µs', 1],
    ['1ms', 1],
    ['1s', 1000],
    ['1m', 60 * 1000],
    ['1h', 60 * 60 * 1000],
    // below test cases are from vega
    ['3.3s', 3300],
    ['4m5s', 4 * 60 * 1000 + 5 * 1000],
    ['4m5.001s', 4 * 60 * 1000 + 5001],
    ['5h6m7.001s', 5 * 60 * 60 * 1000 + 6 * 60 * 1000 + 7001],
    ['8m0.000000001s', 8 * 60 * 1000 + 1 / 1000000],
  ])('parses %s to %d milliseconds', (input, output) => {
    expect(parseDuration(input)).toEqual(output);
  });
});
