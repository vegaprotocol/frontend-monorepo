import { act, renderHook } from '@testing-library/react';
import { useLocalStorage, useLocalStorageSnapshot } from './use-local-storage';

describe('useLocalStorage', () => {
  afterEach(() => window.localStorage.clear());
  it("should return null if there's no value set", () => {
    const { result } = renderHook(() => useLocalStorage('test'));
    const [value] = result.current;
    expect(value).toBeNull();
  });
  it('should return already saved value', () => {
    window.localStorage.setItem('test', '123');
    const { result } = renderHook(() => useLocalStorage('test'));
    const [value] = result.current;
    expect(value).toEqual('123');
  });
  it('should save given value', () => {
    const { result } = renderHook(() => useLocalStorage('test'));
    const setValue = result.current[1];
    expect(result.current[0]).toBeNull();
    act(() => setValue('123'));
    expect(result.current[0]).toEqual('123');
    act(() => setValue('456'));
    expect(result.current[0]).toEqual('456');
  });
  it('should remove given value', () => {
    const { result } = renderHook(() => useLocalStorage('test'));
    const setValue = result.current[1];
    const removeValue = result.current[2];
    act(() => setValue('123'));
    expect(result.current[0]).toEqual('123');
    act(() => removeValue());
    expect(result.current[0]).toBeNull();
  });
  it('should return value set by storage event (by another tab)', () => {
    const { result: A } = renderHook(() => useLocalStorage('test-a'));
    const { result: B } = renderHook(() => useLocalStorage('test-b'));
    act(() => {
      window.localStorage.setItem('test-a', '123');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-a',
          oldValue: window.localStorage.getItem('test-a'),
          storageArea: window.localStorage,
          newValue: '123',
        })
      );
    });
    expect(A.current[0]).toEqual('123');
    expect(B.current[0]).toBeNull();
  });
});

describe('useLocalStorageSnapshot', () => {
  afterEach(() => window.localStorage.clear());
  it("should return null if there's no value set", () => {
    const { result } = renderHook(() => useLocalStorageSnapshot('test'));
    const [value] = result.current;
    expect(value).toBeNull();
  });
  it('should return already saved value', () => {
    window.localStorage.setItem('test', '123');
    const { result } = renderHook(() => useLocalStorageSnapshot('test'));
    const [value] = result.current;
    expect(value).toEqual('123');
  });
  it('should save given value', () => {
    const { result } = renderHook(() => useLocalStorageSnapshot('test'));
    const setValue = result.current[1];
    expect(result.current[0]).toBeNull();
    act(() => setValue('123'));
    expect(result.current[0]).toEqual('123');
    act(() => setValue('456'));
    expect(result.current[0]).toEqual('456');
  });
  it('should remove given value', () => {
    const { result } = renderHook(() => useLocalStorageSnapshot('test'));
    const setValue = result.current[1];
    const removeValue = result.current[2];
    act(() => setValue('123'));
    expect(result.current[0]).toEqual('123');
    act(() => removeValue());
    expect(result.current[0]).toBeNull();
  });
  it('should not return value set by storage event (by another tab)', () => {
    const { result: A } = renderHook(() => useLocalStorageSnapshot('test-a'));
    act(() => {
      window.localStorage.setItem('test-a', '123');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-a',
          oldValue: window.localStorage.getItem('test-a'),
          storageArea: window.localStorage,
          newValue: '123',
        })
      );
    });
    expect(A.current[0]).toBeNull();
  });
});
