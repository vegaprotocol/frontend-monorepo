import { Dialog } from '@vegaprotocol/ui-toolkit';
import { ViewConnectorForm } from './view-connector-form';
import type { ViewConnector } from '../connectors';
import { create } from 'zustand';

type ViewAsDialogStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useViewAsDialog = create<ViewAsDialogStore>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

type ViewAsDialogProps = {
  connector: ViewConnector;
};

export const ViewAsDialog = ({ connector }: ViewAsDialogProps) => {
  const open = useViewAsDialog((state) => state.open);
  const setOpen = useViewAsDialog((state) => state.setOpen);

  return (
    <Dialog
      id="view-as-dialog"
      open={open}
      size="small"
      onChange={(open) => {
        setOpen(open);
      }}
    >
      <ViewConnectorForm
        connector={connector}
        onConnect={() => {
          setOpen(false);
        }}
      />
    </Dialog>
  );
};
