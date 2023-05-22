import { act } from 'react-dom/test-utils';
import { createAgo, now } from './use-yesterday';
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

describe('createAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('1970-01-30T14:36:20.100Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it.each([
    ['yesterday', 24 * 60 * 60 * 1000, '1970-01-29T14:35:00.000Z'],
    ['2 days ago', 2 * 24 * 60 * 60 * 1000, '1970-01-28T14:35:00.000Z'],
    ['5 days ago', 5 * 24 * 60 * 60 * 1000, '1970-01-25T14:35:00.000Z'],
    ['20 days ago', 20 * 24 * 60 * 60 * 1000, '1970-01-10T14:35:00.000Z'],
  ])('returns %s timestamp rounded by 5 minutes', (_, ago, expectedTime) => {
    const { result, rerender } = renderHook(() =>
      createAgo(ago)(5 * 60 * 1000)
    );
    expect(result.current).toEqual(new Date(expectedTime).getTime());
    rerender();
    rerender();
    rerender();
    expect(result.current).toEqual(new Date(expectedTime).getTime());
  });
  it.each([
    ['yesterday', 24 * 60 * 60 * 1000, '1970-01-29T14:40:00.000Z'],
    ['2 days ago', 2 * 24 * 60 * 60 * 1000, '1970-01-28T14:40:00.000Z'],
    ['5 days ago', 5 * 24 * 60 * 60 * 1000, '1970-01-25T14:40:00.000Z'],
    ['20 days ago', 20 * 24 * 60 * 60 * 1000, '1970-01-10T14:40:00.000Z'],
  ])('updates %s timestamp after 5 minutes', (_, ago, expectedTime) => {
    const { result, rerender } = renderHook(() =>
      createAgo(ago)(5 * 60 * 1000)
    );
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
      rerender();
    });
    expect(result.current).toEqual(new Date(expectedTime).getTime());
  });
});
