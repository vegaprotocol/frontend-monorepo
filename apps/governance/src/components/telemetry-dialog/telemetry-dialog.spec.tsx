import { renderHook, act } from '@testing-library/react';
import { useTelemetryDialog, TELEMETRY_ON } from './telemetry-dialog';

describe('useTelemetryDialog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have the correct initial state based on localStorage', () => {
    localStorage.setItem(TELEMETRY_ON, 'true');

    const { result } = renderHook(() => useTelemetryDialog());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.telemetryAccepted).toBe(true);
  });

  it('should update localStorage and the telemetryAccepted state when setTelemetryAccepted is called', () => {
    const { result } = renderHook(() => useTelemetryDialog());

    act(() => {
      result.current.setTelemetryAccepted(true);
    });

    expect(result.current.telemetryAccepted).toBe(true);
    expect(localStorage.getItem(TELEMETRY_ON)).toBe('true');
  });

  it('should update localStorage and the isOpen state when close is called', () => {
    const { result } = renderHook(() => useTelemetryDialog());

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should update the isOpen state when open is called', () => {
    const { result } = renderHook(() => useTelemetryDialog());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should open the dialog if TELEMETRY_ON is not set', () => {
    const { result } = renderHook(() => useTelemetryDialog());
    expect(result.current.isOpen).toBe(true);
  });
});
