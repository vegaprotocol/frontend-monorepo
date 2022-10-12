import { act } from 'react-dom/test-utils';
import { now, useYesterday } from './use-yesterday';
import { renderHook } from '@testing-library/react';

describe('now', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('1970-01-05T14:36:20.100Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it.each([
    { o: '1970-01-05T14:36:20.000Z', roundBy: 1 }, // by 1ms
    { o: '1970-01-05T14:36:00.000Z', roundBy: 60 * 1000 }, // by 1m
    { o: '1970-01-05T14:35:00.000Z', roundBy: 5 * 60 * 1000 }, // by 5m
    { o: '1970-01-05T14:30:00.000Z', roundBy: 10 * 60 * 1000 }, // by 10m
    { o: '1970-01-05T14:20:00.000Z', roundBy: 20 * 60 * 1000 }, // by 20m
    { o: '1970-01-05T14:00:00.000Z', roundBy: 60 * 60 * 1000 }, // by 1h
    { o: '1970-01-05T00:00:00.000Z', roundBy: 24 * 60 * 60 * 1000 }, // by 1d
  ])(
    'returns the now timestamp rounded by given number (ms)',
    ({ roundBy, o }) => {
      expect(now(roundBy)).toEqual(new Date(o).getTime());
    }
  );
});

describe('useYesterday', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('1970-01-05T14:36:20.100Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it('returns yesterday timestamp rounded by 5 minutes', () => {
    const { result, rerender } = renderHook(() => useYesterday());
    expect(result.current).toEqual(
      new Date('1970-01-04T14:35:00.000Z').getTime()
    );
    rerender();
    rerender();
    rerender();
    expect(result.current).toEqual(
      new Date('1970-01-04T14:35:00.000Z').getTime()
    );
  });
  it('updates yesterday timestamp after 5 minutes', () => {
    const { result, rerender } = renderHook(() => useYesterday());
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
      rerender();
    });
    expect(result.current).toEqual(
      new Date('1970-01-04T14:40:00.000Z').getTime()
    );
  });
});
