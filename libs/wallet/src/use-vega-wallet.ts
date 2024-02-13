import { create } from 'zustand';
import { useConfig, useWallet } from './wallet';
import { useVegaWalletDialogStore } from './connect-dialog';
import { useCallback } from 'react';

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
  const config = useConfig();
  const pubKey = useVegaWalletStore((store) => store.pubKey);
  const setPubKey = useVegaWalletStore((store) => store.setPubKey);
  const updateDialog = useVegaWalletDialogStore(
    (store) => store.updateVegaWalletDialog
  );
  const pubKeys = useWallet((store) => store.keys);

  const onConnect = useCallback(() => {
    const state = config.store.getState();

    if (state.keys.length) {
      setPubKey(state.keys[0].publicKey);
    }

    if (state.status === 'connected') {
      setTimeout(() => {
        updateDialog(false);
      }, 1000);
    }
  }, [config.store, setPubKey, updateDialog]);

  return {
    pubKeys,
    pubKey,
    selectPubKey: setPubKey,
    onConnect,
  };
};
