import { create } from 'zustand';
import { useConfig } from './wallet';
import { useVegaWalletDialogStore } from './connect-dialog';

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
  const store = useVegaWalletStore();
  const dialog = useVegaWalletDialogStore();

  const config = useConfig();

  return {
    pubKey: store.pubKey,
    selectPubKey: store.setPubKey,
    onConnect: () => {
      const state = config.store.getState();

      if (state.keys.length) {
        store.setPubKey(state.keys[0].publicKey);
      }

      if (state.status === 'connected') {
        setTimeout(() => {
          dialog.updateVegaWalletDialog(false);
        }, 1000);
      }
    },
  };
};
