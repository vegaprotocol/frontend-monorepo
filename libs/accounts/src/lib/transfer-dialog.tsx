import { t } from '@vegaprotocol/i18n';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { TransferContainer } from './transfer-container';

interface State {
  isOpen: boolean;
  assetId: string | undefined;
}

interface Actions {
  open: (open?: boolean, assetId?: string) => void;
}

export const useTransferDialog = create<State & Actions>()((set) => ({
  isOpen: false,
  assetId: undefined,
  open: (open = true, assetId) => {
    set(() => ({ isOpen: open, assetId }));
  },
}));

export const TransferDialog = () => {
  const { isOpen, open, assetId } = useTransferDialog();
  return (
    <Dialog title={t('Transfer')} open={isOpen} onChange={open} size="small">
      <TransferContainer assetId={assetId} />
    </Dialog>
  );
};
