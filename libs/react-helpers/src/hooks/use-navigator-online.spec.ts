import { act, fireEvent, renderHook } from '@testing-library/react';
import { useNavigatorOnline } from './use-navigator-online';

const setup = () => {
  return renderHook(() => useNavigatorOnline());
};

const turnOn = () => {
  jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
  fireEvent(window, new Event('online'));
};

const turnOff = () => {
  jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
  fireEvent(window, new Event('offline'));
};

describe('useNavigatorOnline', () => {
  it('returns true if connected and false if not', () => {
    const { result } = setup();
    expect(result.current).toBe(true);

    act(turnOff);
    expect(result.current).toBe(false);

    act(turnOn);
    expect(result.current).toBe(true);
  });
});
