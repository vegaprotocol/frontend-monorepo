import { Dialog } from '@vegaprotocol/ui-toolkit';
import { BrowserWallet } from '../browser-wallet';
import { create } from 'zustand';

export const useBrowserWalletDialogStore = create<{
  isOpen: boolean;
  set: (val: boolean) => void;
}>((set) => ({
  isOpen: false,
  set: (val: boolean) => set({ isOpen: val }),
}));

export const BrowserWallerDialog = () => {
  const [isOpen, set] = useBrowserWalletDialogStore((state) => [
    state.isOpen,
    state.set,
  ]);

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
