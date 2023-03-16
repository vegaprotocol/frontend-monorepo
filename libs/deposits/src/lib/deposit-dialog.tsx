import { create } from 'zustand';
import { t } from '@vegaprotocol/i18n';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { DepositContainer } from './deposit-container';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

interface State {
  isOpen: boolean;
  assetId?: string;
}

interface Actions {
  open: (assetId?: string) => void;
  close: () => void;
}

export const useDepositDialog = create<State & Actions>()((set) => ({
  isOpen: false,
  assetId: undefined,
  open: (assetId) => set(() => ({ assetId, isOpen: true })),
  close: () => set(() => ({ assetId: undefined, isOpen: false })),
}));

export const DepositDialog = () => {
  const { assetId, isOpen, open, close } = useDepositDialog();
  const assetDetailsDialogOpen = useAssetDetailsDialogStore(
    (state) => state.isOpen
  );
  const connectWalletDialogIsOpen = useWeb3ConnectStore(
    (state) => state.isOpen
  );
  return (
    <Dialog
      open={isOpen && !(connectWalletDialogIsOpen || assetDetailsDialogOpen)}
      onChange={(isOpen) => (isOpen ? open() : close())}
      title={t('Deposit')}
    >
      <DepositContainer assetId={assetId} />
    </Dialog>
  );
};
