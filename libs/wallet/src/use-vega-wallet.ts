import { create } from 'zustand';
import { useWallet } from './wallet';

interface PubKeyStore {
  pubKey: string | null;
  setPubKey: (key: string) => void;
}

export const useVegaWalletStore = create<PubKeyStore>()((set) => ({
  pubKey: null,
  setPubKey: (key: string) => set({ pubKey: key }),
}));

// Only for vega apps that expect a single selected key
export const useVegaWallet = () => {
  const pubKey = useVegaWalletStore((store) => store.pubKey);
  const setPubKey = useVegaWalletStore((store) => store.setPubKey);
  const pubKeys = useWallet((store) => store.keys);

  return {
    pubKeys,
    pubKey,
    selectPubKey: setPubKey,
  };
};
