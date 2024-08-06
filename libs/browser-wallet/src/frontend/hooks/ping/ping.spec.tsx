import { renderHook } from '@testing-library/react';

import { mockClient } from '@/test-helpers/mock-client';

import initKeepAlive from '../../../lib/mv3-keep-alive';
import { usePing } from '.';

jest.mock('../../../lib/mv3-keep-alive');

describe('usePing', () => {
  it('should setup and clean up interval and timeout properly', () => {
    mockClient();
    const mockKeepAlive = jest.fn();
    (initKeepAlive as jest.Mock).mockReturnValue(
      mockKeepAlive.mockReturnValueOnce({
        keepAliveTimeout: 1,
        keepAliveInterval: 2,
      })
    );

    const { unmount } = renderHook(() => usePing());

    expect(initKeepAlive).toHaveBeenCalled();
    expect(mockKeepAlive).toHaveBeenCalled();

    unmount();
    expect(mockKeepAlive).toHaveBeenCalledWith(null);
  });
});
