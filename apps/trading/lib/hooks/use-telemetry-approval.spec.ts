import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { SentryInit, SentryClose } from '@vegaprotocol/logger';
import { STORAGE_KEY, useTelemetryApproval } from './use-telemetry-approval';
import { Networks } from '@vegaprotocol/environment';

const mockSetValue = jest.fn();
let mockStorageHookResult: [string | null, jest.Mock] = [null, mockSetValue];
jest.mock('@vegaprotocol/logger');
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useLocalStorage: jest.fn(() => mockStorageHookResult),
}));
let mockVegaEnv = 'test';
jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  useEnvironment: jest.fn(() => ({
    VEGA_ENV: mockVegaEnv,
    SENTRY_DSN: 'sentry-dsn',
  })),
}));

describe('useTelemetryApproval', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('when empty hook should return proper array', () => {
    const { result } = renderHook(() => useTelemetryApproval());
    expect(result.current[0]).toEqual('');
    expect(result.current[1]).toEqual(expect.any(Function));
    expect(result.current[2]).toEqual(true);
    expect(result.current[3]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
    expect(mockSetValue).toHaveBeenCalledWith('true');
  });

  it('when NOT empty hook should return proper array', () => {
    mockStorageHookResult = ['false', mockSetValue];
    const { result } = renderHook(() => useTelemetryApproval());
    expect(result.current[0]).toEqual('false');
    expect(result.current[1]).toEqual(expect.any(Function));
    expect(result.current[2]).toEqual(false);
    expect(result.current[3]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('on mainnet hook should init properly', () => {
    mockStorageHookResult = [null, mockSetValue];
    mockVegaEnv = Networks.MAINNET;
    renderHook(() => useTelemetryApproval());
    expect(mockSetValue).toHaveBeenCalledWith('false');
  });

  it('hook should init stuff properly', async () => {
    const { result } = renderHook(() => useTelemetryApproval());
    await act(() => {
      result.current[1]('true');
    });
    await waitFor(() => {
      expect(SentryInit).toHaveBeenCalled();
      expect(mockSetValue).toHaveBeenCalledWith('true');
    });
  });

  it('hook should close stuff properly', async () => {
    const { result } = renderHook(() => useTelemetryApproval());
    await act(() => {
      result.current[1]('false');
    });
    await waitFor(() => {
      expect(SentryClose).toHaveBeenCalled();
      expect(mockSetValue).toHaveBeenCalledWith('false');
    });
  });
});
