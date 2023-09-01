import { useCallback, useContext } from 'react';
import { useVegaWalletDialogStore } from './connect-dialog/vega-wallet-dialog-store';
import { VegaWalletContext } from './context';

export function useVegaWallet() {
  const context = useContext(VegaWalletContext);
  if (context === undefined) {
    throw new Error('useVegaWallet must be used within VegaWalletProvider');
  }
  return context;
}

export function useReconnectVegaWallet() {
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { disconnect } = useVegaWallet();
  const reconnect = useCallback(async () => {
    await disconnect();
    openVegaWalletDialog();
  }, [disconnect, openVegaWalletDialog]);

  return reconnect;
}
