import type { ComponentProps } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { NodeSwitcher } from '../node-switcher';

type NodeSwitcherDialogProps = ComponentProps<typeof NodeSwitcher> & {
  dialogOpen: boolean;
  toggleDialogOpen: (dialogOpen: boolean) => void;
};

export const NodeSwitcherDialog = ({
  config,
  dialogOpen,
  toggleDialogOpen,
  onConnect,
}: NodeSwitcherDialogProps) => {
  return (
    <Dialog open={dialogOpen} onChange={toggleDialogOpen}>
      <NodeSwitcher
        config={config}
        onConnect={(url) => {
          onConnect(url);
          toggleDialogOpen(false);
        }}
      />
    </Dialog>
  );
};
