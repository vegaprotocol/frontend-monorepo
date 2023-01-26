import { fireEvent, renderHook } from '@testing-library/react';
import { useNavigatorOnline } from './use-navigator-online';

const setup = () => {
  return renderHook(() => useNavigatorOnline());
};

describe('useNavigatorOnline', () => {
  it('returns true if connected and false if not', () => {
    const { result } = setup();
    expect(result.current).toBe(true);
    fireEvent(window, new Event('offline'));
    expect(result.current).toBe(false);
    fireEvent(window, new Event('online'));
    expect(result.current).toBe(true);
  });
});
