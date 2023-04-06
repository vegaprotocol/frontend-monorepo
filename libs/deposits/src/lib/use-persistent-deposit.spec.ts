import { renderHook, waitFor, act } from '@testing-library/react';
import { usePersistentDeposit } from './use-persistent-deposit';

describe('usePersistenDeposit', () => {
  it('should return empty data', () => {
    const { result } = renderHook(() => usePersistentDeposit());
    expect(result.current).toEqual([{ assetId: '' }, expect.any(Function)]);
  });
  it('should return empty and properly saved data', async () => {
    const aId = 'test';
    const retObj = { assetId: 'test', amount: '1.00000' };
    const { result } = renderHook(() => usePersistentDeposit(aId));
    expect(result.current).toEqual([{ assetId: 'test' }, expect.any(Function)]);
    await act(() => {
      result.current[1](retObj);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual(retObj);
    });
  });
});
