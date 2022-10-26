import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

export const LocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  },
};

type LocalStorageCallback = (key: string) => void;
const LOCAL_STORAGE_CALLBACKS = new Set<LocalStorageCallback>();
const registerCallback = (callback: LocalStorageCallback) =>
  LOCAL_STORAGE_CALLBACKS.add(callback);
const unregisterCallback = (callback: LocalStorageCallback) =>
  LOCAL_STORAGE_CALLBACKS.delete(callback);
const triggerCallbacks = (key: string) =>
  LOCAL_STORAGE_CALLBACKS.forEach((cb) => cb(key));

export const useLocalStorage = (key: string) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const callback = (cbKey: string) => {
        if (cbKey === key) onStoreChange();
      };
      registerCallback(callback);
      return () => unregisterCallback(callback);
    },
    [key]
  );
  const getSnapshot = () => {
    const item = LocalStorage.getItem(key);
    return item;
  };
  const setValue = useCallback(
    (value: string) => {
      LocalStorage.setItem(key, value);
      triggerCallbacks(key);
    },
    [key]
  );
  const removeValue = useCallback(() => {
    LocalStorage.removeItem(key);
    triggerCallbacks(key);
  }, [key]);
  const value = useSyncExternalStore(subscribe, getSnapshot, () => null);

  // sync in all tabs
  const onStorage = useCallback(
    (ev: StorageEvent) => {
      if (ev.storageArea === window.localStorage && ev.key === key) {
        triggerCallbacks(key);
      }
    },
    [key]
  );
  useEffect(() => {
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, onStorage]);

  return useMemo<
    [string | null | undefined, (value: string) => void, () => void]
  >(() => [value, setValue, removeValue], [removeValue, setValue, value]);
};
