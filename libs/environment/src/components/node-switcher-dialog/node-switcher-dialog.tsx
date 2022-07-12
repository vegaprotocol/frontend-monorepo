import type { ComponentProps } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { NodeSwitcher } from '../node-switcher';

type NodeSwitcherDialogProps = ComponentProps<typeof NodeSwitcher> & {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

export const NodeSwitcherDialog = ({
  config,
  initialErrorType,
  dialogOpen,
  setDialogOpen,
  onConnect,
}: NodeSwitcherDialogProps) => {
  return (
    <Dialog open={dialogOpen}>
      <NodeSwitcher
        config={config}
        initialErrorType={initialErrorType}
        onConnect={(url) => {
          onConnect(url);
          setDialogOpen(false);
        }}
      />
    </Dialog>
  );
};
