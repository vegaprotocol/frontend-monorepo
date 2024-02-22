import { useWallet } from './use-wallet';

export function useChainId() {
  const chainId = useWallet((store) => store.chainId);
  return { chainId };
}
