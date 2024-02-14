import { useStore } from 'zustand';
import { useConfig } from './use-config';

export function useWallet<T>(selector: (store: Store) => T) {
  const config = useConfig();
  const store = useStore(config.store, selector);

  return store;
}
