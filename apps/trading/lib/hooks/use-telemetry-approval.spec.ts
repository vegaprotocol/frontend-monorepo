import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { SentryInit, SentryClose } from '@vegaprotocol/logger';
import {
  STORAGE_KEY,
  STORAGE_SECOND_KEY,
  useTelemetryApproval,
} from './use-telemetry-approval';
import { Networks } from '@vegaprotocol/environment';

const mockSetValue = jest.fn();
let mockStorageHookApprovalResult: [string | null, jest.Mock] = [
  null,
  mockSetValue,
];
const mockSetSecondValue = jest.fn();
let mockStorageHookViewedResult: [string | null, jest.Mock] = [
  null,
  mockSetSecondValue,
];
jest.mock('@vegaprotocol/logger');
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useLocalStorage: jest.fn((key: string) => {
    if (key === 'vega_telemetry_approval') {
      return mockStorageHookApprovalResult;
    }
    return mockStorageHookViewedResult;
  }),
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
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_SECOND_KEY);
    expect(mockSetValue).toHaveBeenCalledWith('true');
    expect(mockSetSecondValue).not.toHaveBeenCalledWith('true');
  });

  it('when approval not empty but viewed is empty should return proper array', () => {
    mockStorageHookApprovalResult = ['false', mockSetValue];
    const { result } = renderHook(() => useTelemetryApproval());
    expect(result.current[0]).toEqual('false');
    expect(result.current[1]).toEqual(expect.any(Function));
    expect(result.current[2]).toEqual(true);
    expect(result.current[3]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_SECOND_KEY);
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockSetSecondValue).not.toHaveBeenCalled();
  });

  it('when NOT empty hook should return proper array', () => {
    mockStorageHookApprovalResult = ['false', mockSetValue];
    mockStorageHookViewedResult = ['true', mockSetSecondValue];
    const { result } = renderHook(() => useTelemetryApproval());
    expect(result.current[0]).toEqual('false');
    expect(result.current[1]).toEqual(expect.any(Function));
    expect(result.current[2]).toEqual(false);
    expect(result.current[3]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('on mainnet hook should init properly', () => {
    mockStorageHookApprovalResult = [null, mockSetValue];
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
      expect(mockSetSecondValue).toHaveBeenCalledWith('true');
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
      expect(mockSetSecondValue).toHaveBeenCalledWith('true');
    });
  });
});
