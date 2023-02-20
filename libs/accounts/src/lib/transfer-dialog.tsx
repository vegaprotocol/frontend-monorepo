import { t } from '@vegaprotocol/react-helpers';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { TransferContainer } from './transfer-container';

interface State {
  isOpen: boolean;
}

interface Actions {
  open: (open?: boolean) => void;
}

export const useTransferDialog = create<State & Actions>((set) => ({
  isOpen: false,
  open: (open = true) => {
    set(() => ({ isOpen: open }));
  },
}));

export const TransferDialog = () => {
  const { isOpen, open } = useTransferDialog();
  return (
    <Dialog title={t('Transfer')} open={isOpen} onChange={open} size="small">
      <TransferContainer />
    </Dialog>
  );
};
