import { useWallet } from './use-wallet';

export function useWalletChainId() {
  const chainId = useWallet((store) => store.chainId);
  return { chainId };
}
