import { renderHook } from '@testing-library/react';

import { useListenForActiveTab } from '.';

const setup = jest.fn();
const teardown = jest.fn();

jest.mock('@/stores/tab-store', () => ({
  useTabStore: jest.fn().mockImplementation((function_) =>
    function_({
      setup,
      teardown,
    })
  ),
}));

describe('ListenForActiveTab', () => {
  it('sets up and tears down listeners appropriately', async () => {
    const view = renderHook(() => useListenForActiveTab());
    expect(setup).toHaveBeenCalled();
    expect(teardown).not.toHaveBeenCalled();
    view.unmount();
    expect(teardown).toHaveBeenCalled();
  });
});
