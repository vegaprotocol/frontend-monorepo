import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
};
export const useNavigatorOnline = () =>
  useSyncExternalStore(
    subscribe,
    () => window.navigator.onLine,
    () => true
  );
