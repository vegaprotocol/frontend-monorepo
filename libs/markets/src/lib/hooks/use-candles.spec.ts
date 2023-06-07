import { renderHook } from '@testing-library/react';
import { useCandles } from './use-candles';

const today = new Date();
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(today.getDate() - 5);

const mockData = [
  {
    high: '6293819',
    low: '6263737',
    open: '6266893',
    close: '6293819',
    volume: '72447',
    periodStart: today.toISOString(),
    __typename: 'Candle',
  },
  null,
  {
    high: '6309988',
    low: '6296335',
    open: '6307451',
    close: '6296335',
    volume: '73657',
    periodStart: today.toISOString(),
    __typename: 'Candle',
  },
  {
    high: '6315153',
    low: '6294001',
    open: '6296335',
    close: '6315152',
    volume: '89395',
    periodStart: today.toISOString(),
    __typename: 'Candle',
  },
  {
    high: '6309988',
    low: '6296335',
    open: '6307451',
    close: '6296335',
    volume: '73657',
    periodStart: fiveDaysAgo.toISOString(),
    __typename: 'Candle',
  },
  {
    high: '6315153',
    low: '6294001',
    open: '6296335',
    close: '6315152',
    volume: '89395',
    periodStart: fiveDaysAgo.toISOString(),
    __typename: 'Candle',
  },
];

jest.mock('@vegaprotocol/data-provider', () => {
  return {
    ...jest.requireActual('@vegaprotocol/data-provider'),
    useThrottledDataProvider: jest.fn(() => ({
      data: mockData,
      error: false,
    })),
  };
});

describe('useCandles', () => {
  it('should return one day candles and five day candles', () => {
    const { result } = renderHook(() => useCandles({ marketId: '3456789' }));
    const expectedOneDayCandles = [
      {
        high: '6293819',
        low: '6263737',
        open: '6266893',
        close: '6293819',
        volume: '72447',
        periodStart: today.toISOString(),
        __typename: 'Candle',
      },
      {
        high: '6309988',
        low: '6296335',
        open: '6307451',
        close: '6296335',
        volume: '73657',
        periodStart: today.toISOString(),
        __typename: 'Candle',
      },
      {
        high: '6315153',
        low: '6294001',
        open: '6296335',
        close: '6315152',
        volume: '89395',
        periodStart: today.toISOString(),
        __typename: 'Candle',
      },
    ];
    expect(result.current).toStrictEqual({
      oneDayCandles: expectedOneDayCandles,
      fiveDaysCandles: mockData.filter(Boolean),
      error: false,
    });
  });
});
