import { Dialog } from '@vegaprotocol/ui-toolkit';
import { BrowserWallet } from '../browser-wallet';
import { create } from 'zustand';
import { useVegaWalletConfig } from '../../lib/hooks/use-vega-wallet-config';
import { useCallback, useEffect, useMemo } from 'react';

export const useBrowserWalletDialogStore = create<{
  isOpen: boolean;
  set: (val: boolean) => void;
}>((set) => ({
  isOpen: false,
  set: (val: boolean) => set({ isOpen: val }),
}));

export const BrowserWalletDialog = () => {
  const [isOpen, set] = useBrowserWalletDialogStore((state) => [
    state.isOpen,
    state.set,
  ]);
  const config = useVegaWalletConfig();
  const quickStartConnector = useMemo(
    () =>
      config?.connectors.find(({ id }) => id === 'embedded-wallet-quickstart'),
    [config?.connectors]
  );

  const setOpen = useCallback(() => set(true), [set]);
  const setClose = useCallback(() => set(false), [set]);

  useEffect(() => {
    quickStartConnector?.on('client.request_transaction_approval', setOpen);
    quickStartConnector?.on('client.request_transaction_decided', setClose);
  }, [setOpen, setClose, quickStartConnector]);

  return (
    <Dialog
      open={isOpen}
      onChange={(open) => {
        set(open);
      }}
    >
      <div className="h-full" style={{ height: 600 }}>
        <BrowserWallet />
      </div>
    </Dialog>
  );
};
