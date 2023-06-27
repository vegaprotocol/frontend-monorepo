import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { SentryInit, SentryClose } from '@vegaprotocol/logger';
import { STORAGE_KEY, useTelemetryApproval } from './use-telemetry-approval';

const mockSetValue = jest.fn();
const mockRemoveValue = jest.fn();
jest.mock('@vegaprotocol/logger');
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useLocalStorage: jest
    .fn()
    .mockImplementation(() => [false, mockSetValue, mockRemoveValue]),
}));
jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({ VEGA_ENV: 'test', SENTRY_DSN: 'sentry-dsn' }),
}));

describe('useTelemetryApproval', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hook should return proper array', () => {
    const { result } = renderHook(() => useTelemetryApproval());
    expect(result.current[0]).toEqual(false);
    expect(result.current[1]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('hook should init stuff properly', async () => {
    const { result } = renderHook(() => useTelemetryApproval());
    await act(() => {
      result.current[1](true);
    });
    await waitFor(() => {
      expect(SentryInit).toHaveBeenCalled();
      expect(mockSetValue).toHaveBeenCalledWith('1');
    });
  });

  it('hook should close stuff properly', async () => {
    const { result } = renderHook(() => useTelemetryApproval());
    await act(() => {
      result.current[1](false);
    });
    await waitFor(() => {
      expect(SentryClose).toHaveBeenCalled();
      expect(mockRemoveValue).toHaveBeenCalledWith();
    });
  });
});
