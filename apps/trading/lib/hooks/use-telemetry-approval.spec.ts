import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { STORAGE_KEY, useTelemetryApproval } from './use-telemetry-approval';
import { SentryInit, SentryClose } from '../utils/sentry-init';

const mockSetValue = jest.fn();
const mockRemoveValue = jest.fn();
// const mockUseLocalStorage = jest.fn().mockImplementation(() => [true, mockSetValue, mockRemoveValue])
jest.mock('../utils/sentry-init');
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useLocalStorage: jest
    .fn()
    .mockImplementation(() => [false, mockSetValue, mockRemoveValue]),
}));

describe('useTelemetryApproval', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('hook should return proper array', () => {
    const res = renderHook(() => useTelemetryApproval());
    expect(res.result.current[0]).toEqual(false);
    expect(res.result.current[1]).toEqual(expect.any(Function));
    expect(useLocalStorage).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('hook should init stuff properly', async () => {
    const res = renderHook(() => useTelemetryApproval());
    await act(() => {
      res.result.current[1](true);
    });
    await waitFor(() => {
      expect(SentryInit).toHaveBeenCalled();
      expect(mockSetValue).toHaveBeenCalledWith('1');
    });
  });

  it('hook should close stuff properly', async () => {
    const res = renderHook(() => useTelemetryApproval());
    await act(() => {
      res.result.current[1](false);
    });
    await waitFor(() => {
      expect(SentryClose).toHaveBeenCalled();
      expect(mockRemoveValue).toHaveBeenCalledWith();
    });
  });
});
