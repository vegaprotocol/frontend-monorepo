import { useWallet } from './use-wallet';

export function usePubKeys() {
  const keys = useWallet((store) => store.keys);
  return {
    pubKeys: keys,
  };
}
