import { Dialog } from '@vegaprotocol/ui-toolkit';
import { NodeSwitcher } from './node-switcher';

export const NodeSwitcherDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
}) => {
  return (
    <Dialog open={open} onChange={setOpen} size="large">
      <NodeSwitcher closeDialog={() => setOpen(false)} />
    </Dialog>
  );
};
