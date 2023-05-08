import { renderHook, act } from '@testing-library/react';
import {
  useTelemetryDialog,
  TELEMETRY_DIALOG_PREVIOUSLY_OPENED,
  TELEMETRY_ACCEPTED,
} from './telemetry-dialog';

describe('useTelemetryDialog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have the correct initial state based on localStorage', () => {
    localStorage.setItem(TELEMETRY_DIALOG_PREVIOUSLY_OPENED, 'true');
    localStorage.setItem(TELEMETRY_ACCEPTED, 'true');

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
    expect(localStorage.getItem(TELEMETRY_ACCEPTED)).toBe('true');
  });

  it('should update localStorage and the isOpen state when close is called', () => {
    const { result } = renderHook(() => useTelemetryDialog());

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(localStorage.getItem(TELEMETRY_DIALOG_PREVIOUSLY_OPENED)).toBe(
      'true'
    );
  });

  it('should update the isOpen state when open is called', () => {
    const { result } = renderHook(() => useTelemetryDialog());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });
});
