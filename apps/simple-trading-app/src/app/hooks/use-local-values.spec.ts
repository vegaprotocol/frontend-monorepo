import { act, renderHook } from '@testing-library/react';
import useLocalValues from './use-local-values';

describe('local values hook', () => {
  it('state of wallet dialog should be properly handled', () => {
    const { result } = renderHook(() => useLocalValues());
    expect(result.current.vegaWalletDialog).toBeDefined();
    expect(result.current.vegaWalletDialog.manage).toBe(false);
    expect(result.current.vegaWalletDialog.connect).toBe(false);
    act(() => {
      result.current.vegaWalletDialog.setConnect(true);
      result.current.vegaWalletDialog.setManage(true);
    });
    expect(result.current.vegaWalletDialog.manage).toBe(true);
    expect(result.current.vegaWalletDialog.connect).toBe(true);
  });
});
