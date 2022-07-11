import type { ComponentProps } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { NodeSwitcher } from '../node-switcher';

type NodeSwitcherDialogProps = ComponentProps<typeof NodeSwitcher> & {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

export const NodeSwitcherDialog = ({
  config,
  dialogOpen,
  setDialogOpen,
  onConnect,
}: NodeSwitcherDialogProps) => {
  return (
    <Dialog open={dialogOpen}>
      <NodeSwitcher
        config={config}
        onConnect={(url) => {
          onConnect(url);
          setDialogOpen(false);
        }}
      />
    </Dialog>
  );
};
