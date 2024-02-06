import { renderHook } from '@testing-library/react';
import { useResponseTime } from './time';

const mockResponseTime = 50;
global.performance.getEntriesByName = jest.fn().mockReturnValue([
  {
    duration: mockResponseTime,
  },
]);

describe('useResponseTime', () => {
  it('returns response time when url is valid', () => {
    const { result } = renderHook(() =>
      useResponseTime('https://localhost:1234')
    );
    expect(result.current.responseTime).toBe(50);
  });
  it('does not return response time when url is invalid', () => {
    const { result } = renderHook(() => useResponseTime('nope'));
    expect(result.current.responseTime).toBeUndefined();
  });
});
