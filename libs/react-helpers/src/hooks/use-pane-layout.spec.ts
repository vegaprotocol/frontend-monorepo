import { renderHook, act, waitFor } from '@testing-library/react';
import { usePaneLayout } from './use-pane-layout';

describe('usePaneLayout', () => {
  it('should return proper values', () => {
    const ret = renderHook(() => usePaneLayout({ id: 'testid' }));
    expect(ret.result.current[0]).toStrictEqual([]);
    expect(ret.result.current[1]).toStrictEqual(expect.any(Function));
  });
  it('setter should change value', async () => {
    const ret = renderHook(() => usePaneLayout({ id: 'testid' }));
    await act(() => {
      ret.result.current[1]([100, 50, 50]);
    });
    await waitFor(() => {
      expect(ret.result.current[0]).toStrictEqual(['50%', '25%', '25%']);
    });
  });
});
