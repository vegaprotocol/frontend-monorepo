import type { ComponentProps } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { NodeSwitcher } from '../node-switcher';
import { Configuration } from '../../types';

type NodeSwitcherDialogProps = Pick<ComponentProps<typeof NodeSwitcher>, 'initialErrorType' | 'onConnect'> & {
  config?: Configuration;
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
    <Dialog open={dialogOpen} onChange={setDialogOpen}>
      {!config && t('Loading configuration...')}
      {config && dialogOpen && (
        <NodeSwitcher
          config={config}
          initialErrorType={initialErrorType}
          onConnect={(url) => {
            onConnect(url);
            setDialogOpen(false);
          }}
        />
      )}
    </Dialog>
  );
};
